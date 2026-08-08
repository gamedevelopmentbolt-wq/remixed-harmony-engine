import { useEffect, useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { Dropzone } from "./Dropzone";
import { tools } from "@/lib/tools";
import { loadPdfjs } from "@/lib/pdfjs-loader";
import { downloadBlob } from "@/lib/tool-utils";
import { ArrowLeft, ArrowRight, Copy, Trash2 } from "lucide-react";

interface Page { id: string; sourceIndex: number; thumb: string }

export function PdfOrganizeTool() {
  const tool = tools.find((t) => t.slug === "pdf-organize")!;
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  useEffect(() => {
    if (!file) return;
    (async () => {
      setStatus({ kind: "working", message: "Rendering thumbnails…" });
      try {
        const pdfjs = await loadPdfjs();
        const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        const out: Page[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext("2d")!, canvas, viewport }).promise;
          out.push({ id: `${i}-${Math.random()}`, sourceIndex: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7) });
        }
        setPages(out);
        setStatus({ kind: "idle" });
      } catch (e: any) {
        setStatus({ kind: "error", message: e?.message ?? "Failed to open PDF." });
      }
    })();
  }, [file]);

  function move(id: string, dir: -1 | 1) {
    setPages((cur) => {
      const i = cur.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(id: string) { setPages((c) => c.filter((p) => p.id !== id)); }
  function duplicate(id: string) {
    setPages((c) => {
      const i = c.findIndex((p) => p.id === id);
      if (i < 0) return c;
      const copy = { ...c[i], id: `${c[i].sourceIndex}-${Math.random()}` };
      return [...c.slice(0, i + 1), copy, ...c.slice(i + 1)];
    });
  }

  async function build() {
    if (!file || pages.length === 0) return;
    setStatus({ kind: "working", message: "Building new PDF…" });
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.sourceIndex));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as any], { type: "application/pdf" });
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + "-organized.pdf");
      setStatus({ kind: "success", message: `Saved ${pages.length}-page PDF.` });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? "Failed to build PDF." });
    }
  }

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Upload a PDF — the tool renders a thumbnail of every page in your browser.",
        "Reorder with the arrows, duplicate any page, or delete pages you don't need.",
        "Click Save to download a fresh PDF with your new page order.",
      ]}>
      <Dropzone accept="application/pdf" multiple={false} onFiles={(fs) => { setFile(fs[0]); setPages([]); }} />
      {pages.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((p, i) => (
              <div key={p.id} className="rounded-lg border border-line bg-white p-2">
                <img src={p.thumb} alt={`Page ${i + 1}`} className="w-full rounded" />
                <p className="mt-1 text-center font-mono text-xs text-graphite">#{i + 1} (src p{p.sourceIndex + 1})</p>
                <div className="mt-2 flex justify-center gap-1">
                  <button aria-label="Move left" onClick={() => move(p.id, -1)} className="rounded border border-line p-1 hover:bg-paper-2"><ArrowLeft className="h-3 w-3" /></button>
                  <button aria-label="Move right" onClick={() => move(p.id, 1)} className="rounded border border-line p-1 hover:bg-paper-2"><ArrowRight className="h-3 w-3" /></button>
                  <button aria-label="Duplicate" onClick={() => duplicate(p.id)} className="rounded border border-line p-1 hover:bg-paper-2"><Copy className="h-3 w-3" /></button>
                  <button aria-label="Delete" onClick={() => remove(p.id)} className="rounded border border-line p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
          <PrimaryButton onClick={build} loading={status.kind === "working"}>Save reorganized PDF</PrimaryButton>
        </>
      )}
    </ToolShell>
  );
}
