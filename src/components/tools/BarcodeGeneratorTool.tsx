import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { PrimaryButton, GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Format = "CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC" | "ITF14";

const FORMATS: { k: Format; label: string; hint: string }[] = [
  { k: "CODE128", label: "CODE128", hint: "any letters or digits" },
  { k: "CODE39", label: "CODE39", hint: "A–Z, 0–9, and - . $ / + %" },
  { k: "EAN13", label: "EAN-13", hint: "exactly 12 or 13 digits" },
  { k: "EAN8", label: "EAN-8", hint: "exactly 7 or 8 digits" },
  { k: "UPC", label: "UPC-A", hint: "exactly 11 or 12 digits" },
  { k: "ITF14", label: "ITF-14", hint: "exactly 13 or 14 digits" },
];

export function BarcodeGeneratorTool() {
  const tool = tools.find((t) => t.slug === "barcode-generator")!;
  const [format, setFormat] = useState<Format>("CODE128");
  const [value, setValue] = useState("EASYFILEMAGIC-2026");
  const [showText, setShowText] = useState(true);
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (format === "CODE128" && value === "EASYFILEMAGIC-2026") setValue("EASYFILEMAGIC-2026");
    if (format === "EAN13" && !/^\d{12,13}$/.test(value)) setValue("590123412345");
    if (format === "EAN8" && !/^\d{7,8}$/.test(value)) setValue("9638507");
    if (format === "UPC" && !/^\d{11,12}$/.test(value)) setValue("03600029145");
    if (format === "ITF14" && !/^\d{13,14}$/.test(value)) setValue("1234567890123");
    if (format === "CODE39" && !/^[A-Z0-9\-.$/+% ]+$/.test(value)) setValue("HELLO-123");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  useEffect(() => {
    if (!value) {
      setStatus({ kind: "idle" });
      return;
    }
    try {
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, value, { format, displayValue: showText, margin: 12, height: 90, width: 2 });
      }
      if (svgRef.current) {
        JsBarcode(svgRef.current, value, { format, displayValue: showText, margin: 12, height: 90, width: 2 });
      }
      setStatus({ kind: "idle" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message: "Invalid value for " + format + ". " + msg });
    }
  }, [value, format, showText]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((b) => {
      if (b) downloadBlob(b, `barcode-${format.toLowerCase()}.png`);
    }, "image/png");
    setStatus({ kind: "success", message: "PNG downloaded." });
  };
  const downloadSvg = () => {
    if (!svgRef.current) return;
    const src = new XMLSerializer().serializeToString(svgRef.current);
    downloadBlob(new Blob([src], { type: "image/svg+xml" }), `barcode-${format.toLowerCase()}.svg`);
    setStatus({ kind: "success", message: "SVG downloaded." });
  };

  const hint = FORMATS.find((f) => f.k === format)?.hint ?? "";

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick a barcode symbology — CODE128 is the flexible default.",
        "Type or paste the value. Numeric formats validate live.",
        "Download as PNG for photos and prints, or SVG for crisp scaling in design tools.",
      ]}
    >
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Format</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FORMATS.map((f) => (
            <label
              key={f.k}
              className={"cursor-pointer rounded-xl border p-3 text-center transition " + (format === f.k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")}
            >
              <input type="radio" name="fmt" value={f.k} checked={format === f.k} onChange={() => setFormat(f.k)} className="sr-only" />
              <p className="font-mono text-sm font-bold">{f.label}</p>
              <p className={"mt-1 text-[10px] " + (format === f.k ? "text-paper/70" : "text-graphite/60")}>{f.hint}</p>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Value</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm text-ink"
        />
        <span className="mt-1 block text-xs text-graphite/70">Format expects: {hint}</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Show value below the barcode</span>
      </label>

      <div className="rounded-xl border border-line bg-white p-4">
        <canvas ref={canvasRef} className="mx-auto block max-w-full" />
        {/* Hidden SVG copy for download */}
        <svg ref={svgRef} className="hidden" />
      </div>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={downloadPng} disabled={status.kind === "error"}>
          Download PNG
        </PrimaryButton>
        <GhostButton onClick={downloadSvg} disabled={status.kind === "error"}>
          Download SVG
        </GhostButton>
      </div>
    </ToolShell>
  );
}
