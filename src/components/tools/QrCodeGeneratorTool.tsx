import { useEffect, useRef, useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Ecl = "L" | "M" | "Q" | "H";

export function QrCodeGeneratorTool() {
  const tool = tools.find((t) => t.slug === "qr-code-generator")!;
  const [text, setText] = useState("https://easyfilemagic.com");
  const [ecl, setEcl] = useState<Ecl>("M");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canvasRef.current || !text.trim()) return;
      try {
        const QR = (await import("qrcode")).default;
        if (cancelled) return;
        await QR.toCanvas(canvasRef.current, text, {
          errorCorrectionLevel: ecl,
          margin: 2,
          width: 320,
          color: { dark: "#14213D", light: "#F3F4EF" },
        });
        setStatus({ kind: "idle" });
      } catch (err) {
        console.error(err);
        setStatus({ kind: "error", message: "Text is too long for the chosen error-correction level." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, ecl]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((b) => {
      if (b) downloadBlob(b, "qr-code.png");
      setStatus({ kind: "success", message: "Downloaded qr-code.png." });
    }, "image/png");
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Type or paste any link or text — it can be plain text, a URL, or contact info.",
        "Pick an error-correction level (higher recovers from more damage).",
        "The QR renders live; click Download to save it as a PNG.",
      ]}
    >
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Text or URL</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-sm text-graphite focus:border-ink focus:outline-none"
          placeholder="https://example.com"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-ink">Error correction</legend>
        <div className="grid grid-cols-4 gap-2">
          {(["L", "M", "Q", "H"] as Ecl[]).map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer rounded-xl border p-3 text-center text-sm transition " +
                (ecl === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite hover:border-ink/60")
              }
            >
              <input type="radio" name="ecl" value={k} checked={ecl === k} onChange={() => setEcl(k)} className="sr-only" />
              <p className="font-mono text-sm font-bold">{k}</p>
              <p className={"mt-1 text-[10px] uppercase tracking-wider " + (ecl === k ? "text-paper/70" : "text-graphite/60")}>
                {k === "L" ? "7%" : k === "M" ? "15%" : k === "Q" ? "25%" : "30%"}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-paper-2/50 p-6">
        <canvas ref={canvasRef} className="rounded-md bg-paper" aria-label="Generated QR code" />
        <PrimaryButton onClick={download} disabled={!text.trim()}>
          Download PNG
        </PrimaryButton>
      </div>
    </ToolShell>
  );
}
