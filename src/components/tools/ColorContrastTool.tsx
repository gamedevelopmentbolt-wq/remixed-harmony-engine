import { useMemo, useState } from "react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ColorContrastTool() {
  const tool = tools.find((t) => t.slug === "color-contrast")!;
  const [fg, setFg] = useState("#111111");
  const [bg, setBg] = useState("#f5f5f5");

  const result = useMemo(() => {
    const rgbFg = hexToRgb(fg);
    const rgbBg = hexToRgb(bg);
    if (!rgbFg || !rgbBg) return null;
    const l1 = lum(rgbFg);
    const l2 = lum(rgbBg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [fg, bg]);

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Pick a foreground (text) color and a background color.",
        "The tool computes the WCAG 2.1 contrast ratio and shows if it passes AA and AAA for both normal and large text.",
        "Adjust either color until it passes at least AA — no signup and no data leaves your browser.",
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Foreground (text)" value={fg} onChange={setFg} />
        <ColorField label="Background" value={bg} onChange={setBg} />
      </div>

      <div
        className="rounded-xl border border-line p-8 text-center"
        style={{ background: bg, color: fg }}
      >
        <p className="text-2xl font-bold">The quick brown fox</p>
        <p className="mt-2 text-sm">jumps over the lazy dog · 1234567890</p>
      </div>

      {result && (
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-graphite/60">Contrast ratio</p>
          <p className="mt-1 font-mono text-4xl font-bold text-ink">{result.ratio.toFixed(2)} : 1</p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Row label="WCAG AA — normal text (≥ 4.5)" pass={result.aaNormal} />
            <Row label="WCAG AA — large text (≥ 3)" pass={result.aaLarge} />
            <Row label="WCAG AAA — normal text (≥ 7)" pass={result.aaaNormal} />
            <Row label="WCAG AAA — large text (≥ 4.5)" pass={result.aaaLarge} />
          </ul>
        </div>
      )}
    </ToolShell>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-line" aria-label={label} />
      <div className="flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">{label}</p>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 w-full border-none bg-transparent p-0 font-mono text-sm outline-none" />
      </div>
    </label>
  );
}

function Row({ label, pass }: { label: string; pass: boolean }) {
  return (
    <li className={`flex items-center justify-between rounded-md border px-3 py-2 ${pass ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-red-300 bg-red-50 text-red-800"}`}>
      <span>{label}</span>
      <span className="font-mono text-xs font-bold">{pass ? "PASS" : "FAIL"}</span>
    </li>
  );
}
