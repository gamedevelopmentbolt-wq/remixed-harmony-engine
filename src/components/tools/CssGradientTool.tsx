import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

type Type = "linear" | "radial";

export function CssGradientTool() {
  const tool = tools.find((t) => t.slug === "css-gradient")!;
  const [c1, setC1] = useState("#f97316");
  const [c2, setC2] = useState("#1e1b4b");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<Type>("linear");

  const css = useMemo(
    () => (type === "linear" ? `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)` : `radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)`),
    [c1, c2, angle, type]
  );
  const full = `background: ${css};`;

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Pick two colors and choose linear or radial. Set the angle for linear gradients.",
        "Live preview updates as you tweak; the CSS is generated instantly.",
        "Click Copy CSS to paste straight into your stylesheet — nothing is uploaded.",
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Start color" value={c1} onChange={setC1} />
        <ColorField label="End color" value={c2} onChange={setC2} />
        <div className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Type</p>
            <div className="mt-1 flex gap-2">
              {(["linear", "radial"] as Type[]).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={type === t ? "rounded border border-ink bg-ink px-3 py-1 font-mono text-xs uppercase text-paper" : "rounded border border-line bg-white px-3 py-1 font-mono text-xs uppercase text-graphite hover:border-ink"}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Angle ({angle}°)</p>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} disabled={type === "radial"} className="mt-2 w-full" />
          </div>
        </label>
      </div>

      <div className="h-52 rounded-xl border border-line" style={{ background: css }} />

      <div className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
        <code className="flex-1 truncate font-mono text-xs text-graphite">{full}</code>
        <button onClick={() => navigator.clipboard.writeText(full)} className="inline-flex items-center gap-1 rounded border border-line px-3 py-1.5 font-mono text-xs hover:bg-paper-2"><Copy className="h-3.5 w-3.5" /> Copy CSS</button>
      </div>
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
