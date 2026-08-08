import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { FileList } from "./FileList";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

// pdfjs v6 uses Map.prototype.getOrInsertComputed (Stage 3 proposal) internally;
// polyfill it for browsers that don't ship it yet.
if (typeof Map !== "undefined") {
  const proto = Map.prototype as unknown as {
    getOrInsertComputed?: <K, V>(this: Map<K, V>, key: K, fn: (k: K) => V) => V;
  };
  if (typeof proto.getOrInsertComputed !== "function") {
    proto.getOrInsertComputed = function <K, V>(this: Map<K, V>, key: K, fn: (k: K) => V) {
      if (!this.has(key)) this.set(key, fn(key));
      return this.get(key) as V;
    };
  }
}

interface PdfImgObj {
  width: number;
  height: number;
  kind?: number;
  data?: Uint8ClampedArray | Uint8Array;
  bitmap?: ImageBitmap;
}

async function imgObjToPngBlob(img: PdfImgObj): Promise<Blob | null> {
  const { width, height } = img;
  if (!width || !height) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (img.bitmap) {
    ctx.drawImage(img.bitmap, 0, 0);
  } else if (img.data) {
    const rgba = new Uint8ClampedArray(width * height * 4);
    const src = img.data;
    // kind: 1 = GRAYSCALE_1BPP (packed bits), 2 = RGB_24BPP, 3 = RGBA_32BPP
    if (img.kind === 3 || src.length === width * height * 4) {
      rgba.set(src as Uint8ClampedArray);
    } else if (img.kind === 2 || src.length === width * height * 3) {
      for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
        rgba[j] = src[i];
        rgba[j + 1] = src[i + 1];
        rgba[j + 2] = src[i + 2];
        rgba[j + 3] = 255;
      }
    } else {
      // grayscale fallback
      const pixels = width * height;
      if (src.length >= pixels) {
        for (let i = 0, j = 0; i < pixels; i++, j += 4) {
          const v = src[i];
          rgba[j] = v;
          rgba[j + 1] = v;
          rgba[j + 2] = v;
          rgba[j + 3] = 255;
        }
      } else {
        return null;
      }
    }
    ctx.putImageData(new ImageData(rgba, width, height), 0, 0);
  } else {
    return null;
  }
  return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
}

export function ExtractImagesPdfTool() {
  const tool = tools.find((t) => t.slug === "extract-images-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const onFiles = (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf"));
    if (!f) return setStatus({ kind: "error", message: "Please choose a PDF file." });
    setFile(f);
    setStatus({ kind: "idle" });
  };

  const run = async () => {
    if (!file) return;
    try {
      setStatus({ kind: "working", message: "Loading PDF…", progress: 3 });
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const total = doc.numPages;
      const OPS = pdfjs.OPS as Record<string, number>;
      const imageOps = new Set<number>([
        OPS.paintImageXObject,
        OPS.paintInlineImageXObject,
        OPS.paintJpegXObject,
        OPS.paintImageXObjectRepeat,
      ]);

      const getObj = (
        objs: { get: (n: string, cb: (o: PdfImgObj) => void) => void; has?: (n: string) => boolean },
        name: string,
      ) =>
        new Promise<PdfImgObj | null>((resolve) => {
          try {
            objs.get(name, (o) => resolve(o ?? null));
          } catch {
            resolve(null);
          }
        });

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let count = 0;
      const seen = new Set<string>();

      for (let p = 1; p <= total; p++) {
        setStatus({
          kind: "working",
          message: `Scanning page ${p} of ${total}…`,
          progress: 5 + (p / total) * 85,
        });
        const page = await doc.getPage(p);
        // Render at tiny scale to force pdfjs to resolve image XObjects into page.objs.
        try {
          const vp = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(vp.width);
          canvas.height = Math.ceil(vp.height);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
          }
        } catch {
          /* ignore render errors — still try op list */
        }
        const opList = await page.getOperatorList();
        for (let i = 0; i < opList.fnArray.length; i++) {
          const fn = opList.fnArray[i];
          if (!imageOps.has(fn)) continue;
          const args = opList.argsArray[i] as unknown[];
          const name = typeof args?.[0] === "string" ? (args[0] as string) : null;
          let obj: PdfImgObj | null = null;
          try {
            if (!name) {
              // inline image: args[0] is the object itself
              obj = args[0] as PdfImgObj;
            } else {
              obj = await getObj(page.objs as never, name);
              if (!obj) {
                const common = (doc as unknown as { commonObjs?: never }).commonObjs;
                if (common) obj = await getObj(common as never, name);
              }
            }
          } catch {
            obj = null;
          }
          if (!obj) continue;
          const key = `${name ?? "inline"}:${obj.width}x${obj.height}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const blob = await imgObjToPngBlob(obj);
          if (!blob) continue;
          count += 1;
          const fname = `page${String(p).padStart(3, "0")}_img${String(count).padStart(3, "0")}.png`;
          zip.file(fname, blob);
        }
        try {
          page.cleanup();
        } catch {
          /* ignore */
        }
      }

      if (count === 0) {
        setStatus({
          kind: "error",
          message: "No embedded images were found in this PDF (it may be vector-only or text-only).",
        });
        return;
      }
      setStatus({ kind: "working", message: "Packaging ZIP…", progress: 95 });
      const outBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(outBlob, file.name.replace(/\.pdf$/i, "") + "-images.zip");
      setStatus({ kind: "success", message: `Extracted ${count} image${count === 1 ? "" : "s"}.` });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not read that PDF. It may be encrypted." });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF that contains photos, scans, diagrams or logos.",
        "We walk every page and pull each embedded image out at its original resolution.",
        "You get a ZIP of PNG files, one per image, ready to reuse.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file" />
      ) : (
        <FileList files={[file]} onRemove={() => setFile(null)} />
      )}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
          Extract images
        </PrimaryButton>
      </div>
    </ToolShell>
  );
}