import { useEffect, useRef, useState } from "react";
import { Dropzone } from "./Dropzone";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";
import { loadPdfjs } from "@/lib/pdfjs-loader";

interface Placement {
  id: string;
  page: number; // 1-based
  // fractions of page width/height (top-left origin)
  x: number;
  y: number;
  w: number;
  h: number;
}

type SigMode = "draw" | "type";

export function SignPdfTool() {
  const tool = tools.find((t) => t.slug === "sign-pdf")!;
  const [file, setFile] = useState<File | null>(null);
  const [pageImages, setPageImages] = useState<{ url: string; w: number; h: number }[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const [sigMode, setSigMode] = useState<SigMode>("draw");
  const [typed, setTyped] = useState("");
  const [sigDataUrl, setSigDataUrl] = useState<string>("");
  const drawRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const onFiles = async (fs: File[]) => {
    const f = fs.find((x) => x.type === "application/pdf" || /\.pdf$/i.test(x.name));
    if (!f) return setStatus({ kind: "error", message: "Please choose a PDF file." });
    setFile(f);
    setPlacements([]);
    setStatus({ kind: "working", message: "Rendering pages…", progress: 10 });
    try {
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
      const imgs: { url: string; w: number; h: number }[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport: vp } as unknown as Parameters<typeof page.render>[0]).promise;
        imgs.push({ url: canvas.toDataURL("image/png"), w: canvas.width, h: canvas.height });
        setStatus({ kind: "working", message: `Rendering page ${i}…`, progress: 10 + (i / doc.numPages) * 80 });
      }
      setPageImages(imgs);
      setStatus({ kind: "idle" });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not open this PDF. It may be encrypted. (" + detail + ")" });
    }
  };

  // Drawing canvas
  useEffect(() => {
    const c = drawRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#0b1220";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
  }, [sigMode]);

  const drawStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const c = drawRef.current!;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(
      ((e.clientX - rect.left) / rect.width) * c.width,
      ((e.clientY - rect.top) / rect.height) * c.height,
    );
  };
  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = drawRef.current!;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.lineTo(
      ((e.clientX - rect.left) / rect.width) * c.width,
      ((e.clientY - rect.top) / rect.height) * c.height,
    );
    ctx.stroke();
  };
  const drawEnd = () => {
    drawing.current = false;
  };
  const clearDraw = () => {
    const c = drawRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
  };
  const captureDrawn = () => {
    if (!drawRef.current) return;
    setSigDataUrl(drawRef.current.toDataURL("image/png"));
  };
  const captureTyped = () => {
    if (!typed.trim()) return;
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 220;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0b1220";
    ctx.font = "italic 120px 'Segoe Script', 'Brush Script MT', cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(typed.trim(), 20, c.height / 2);
    setSigDataUrl(c.toDataURL("image/png"));
  };

  const addPlacement = (pageIndex: number) => {
    if (!sigDataUrl) return;
    setPlacements((prev) => [
      ...prev,
      { id: crypto.randomUUID(), page: pageIndex + 1, x: 0.35, y: 0.7, w: 0.3, h: 0.1 },
    ]);
  };
  const updatePlacement = (id: string, patch: Partial<Placement>) => {
    setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const removePlacement = (id: string) => setPlacements((prev) => prev.filter((p) => p.id !== id));

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    const target = e.currentTarget.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const placement = placements.find((p) => p.id === id)!;
    const origX = placement.x;
    const origY = placement.y;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      updatePlacement(id, {
        x: Math.max(0, Math.min(1 - placement.w, origX + dx)),
        y: Math.max(0, Math.min(1 - placement.h, origY + dy)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startResize = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget.parentElement!.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();
    const startX = e.clientX;
    const placement = placements.find((p) => p.id === id)!;
    const origW = placement.w;
    const aspect = placement.h / placement.w;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const w = Math.max(0.05, Math.min(1 - placement.x, origW + dx));
      updatePlacement(id, { w, h: w * aspect });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const run = async () => {
    if (!file || !sigDataUrl || placements.length === 0) {
      setStatus({ kind: "error", message: "Add a signature and place it on at least one page." });
      return;
    }
    try {
      setStatus({ kind: "working", message: "Embedding signature…", progress: 20 });
      const { PDFDocument } = await import("pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pngBytes = await (await fetch(sigDataUrl)).arrayBuffer();
      const png = await pdf.embedPng(pngBytes);
      const pages = pdf.getPages();
      for (const p of placements) {
        const page = pages[p.page - 1];
        if (!page) continue;
        const { width, height } = page.getSize();
        page.drawImage(png, {
          x: p.x * width,
          y: height - (p.y + p.h) * height,
          width: p.w * width,
          height: p.h * height,
        });
      }
      setStatus({ kind: "working", message: "Saving signed PDF…", progress: 90 });
      const outBytes = await pdf.save();
      downloadBlob(new Blob([outBytes as BlobPart], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-signed.pdf");
      setStatus({ kind: "success", message: "Signed PDF downloaded." });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Could not sign the PDF. Make sure it isn't password-protected. (" + detail + ")" });
    }
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop a PDF. Every page renders as a preview so you can pick where to sign.",
        "Draw your signature or type it in a script font. Drag and resize where it should sit.",
        "Add signatures to as many pages as you need, then download the signed PDF.",
      ]}
    >
      {!file ? (
        <Dropzone accept="application/pdf,.pdf" multiple={false} onFiles={onFiles} hint="One PDF file" />
      ) : (
        <div className="space-y-6">
          <fieldset className="space-y-3 rounded-xl border border-line bg-white p-4">
            <legend className="px-1 font-mono text-xs uppercase tracking-wider text-ink">Signature</legend>
            <div className="flex flex-wrap gap-2">
              {(["draw", "type"] as SigMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSigMode(m)}
                  aria-pressed={sigMode === m}
                  className={
                    "inline-flex h-8 items-center rounded-full border px-3 font-mono text-[11px] uppercase tracking-wider transition " +
                    (sigMode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite/80")
                  }
                >
                  {m === "draw" ? "Draw" : "Type"}
                </button>
              ))}
            </div>
            {sigMode === "draw" ? (
              <div className="space-y-2">
                <canvas
                  ref={drawRef}
                  width={800}
                  height={220}
                  onPointerDown={drawStart}
                  onPointerMove={drawMove}
                  onPointerUp={drawEnd}
                  onPointerLeave={drawEnd}
                  className="w-full max-w-2xl touch-none rounded-lg border border-line bg-white"
                  style={{ aspectRatio: "800 / 220" }}
                />
                <div className="flex flex-wrap gap-3">
                  <GhostButton type="button" onClick={captureDrawn}>
                    Use this signature
                  </GhostButton>
                  <button type="button" onClick={clearDraw} className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink">
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Your name"
                  className="h-10 flex-1 min-w-[220px] rounded-md border border-line bg-white px-3 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                />
                <GhostButton type="button" onClick={captureTyped}>
                  Use this signature
                </GhostButton>
              </div>
            )}
            {sigDataUrl && (
              <div className="rounded-lg border border-line bg-paper-2 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-graphite/60">Preview</p>
                <img src={sigDataUrl} alt="Signature" className="max-h-24" />
              </div>
            )}
          </fieldset>

          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-ink">
              Pages · click "Add here" to drop your signature, then drag/resize
            </p>
            {pageImages.map((img, i) => {
              const pagePlacements = placements.filter((p) => p.page === i + 1);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-graphite/60">
                      Page {i + 1} of {pageImages.length}
                    </p>
                    <GhostButton
                      type="button"
                      onClick={() => addPlacement(i)}
                      disabled={!sigDataUrl}
                      className="!h-8 !px-3 !text-[11px]"
                    >
                      + Add here
                    </GhostButton>
                  </div>
                  <div className="relative inline-block max-w-full overflow-hidden rounded-lg border border-line bg-white shadow-sm">
                    <img src={img.url} alt={`Page ${i + 1}`} className="block max-w-full" draggable={false} />
                    {pagePlacements.map((p) => (
                      <div
                        key={p.id}
                        className="absolute border-2 border-signal/70 bg-signal/5"
                        style={{
                          left: `${p.x * 100}%`,
                          top: `${p.y * 100}%`,
                          width: `${p.w * 100}%`,
                          height: `${p.h * 100}%`,
                        }}
                      >
                        <img src={sigDataUrl} alt="Signature" className="pointer-events-none h-full w-full object-contain" />
                        <div
                          onPointerDown={(e) => startDrag(e, p.id)}
                          className="absolute inset-0 cursor-move"
                          aria-label="Move signature"
                        />
                        <button
                          type="button"
                          onClick={() => removePlacement(p.id)}
                          className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-paper"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                        <div
                          onPointerDown={(e) => startResize(e, p.id)}
                          className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize border border-ink bg-signal"
                          aria-label="Resize"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={run} disabled={placements.length === 0 || !sigDataUrl || status.kind === "working"}>
              Download signed PDF
            </PrimaryButton>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPageImages([]);
                setPlacements([]);
                setSigDataUrl("");
              }}
              className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
