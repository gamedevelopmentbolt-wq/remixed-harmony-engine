import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ToolShell } from "./ToolShell";
import { tools } from "@/lib/tools";

export function BoxShadowTool() {
  const tool = tools.find((t) => t.slug === "box-shadow")!;
  const [x, setX] = useState(0);
  const [y, setY] = useState(10);
  const [blur, setBlur] = useState(25);
  const [spread, setSpread] = useState(-5);
  const [color, setColor] = useState("#0f172a");
  const [alpha, setAlpha] = useState(20);
  const [inset, setInset] = useState(false);

  const rgba = useMemo(() => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`;
  }, [color, alpha]);

  const css = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
  const full = `box-shadow: ${css};`;

  return (
    <ToolShell
      tool={tool}
      howItWorks={[
        "Drag the sliders to shape a CSS box-shadow — offset, blur, spread, color and opacity.",
        "Toggle inset for inner shadows. The preview updates live as you tweak.",
        "Copy the generated CSS and paste it into your stylesheet.",
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label={`Offset X (${x}px)`} value={x} min={-100} max={100} onChange={setX} />
        <Slider label={`Offset Y (${y}px)`} value={y} min={-100} max={100} onChange={setY} />
        <Slider label={`Blur (${blur}px)`} value={blur} min={0} max={200} onChange={setBlur} />
        <Slider label={`Spread (${spread}px)`} value={spread} min={-50} max={100} onChange={setSpread} />
        <div className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-line" aria-label="Shadow color" />
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Shadow color</p>
            <input value={color} onChange={(e) => setColor(e.target.value)} className="mt-0.5 w-full border-none bg-transparent p-0 font-mono text-sm outline-none" />
          </div>
        </div>
        <Slider label={`Opacity (${alpha}%)`} value={alpha} min={0} max={100} onChange={setAlpha} />
        <label className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
          <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-widest text-graphite/80">Inset shadow</span>
        </label>
      </div>

      <div className="rounded-xl bg-paper-2/60 p-16">
        <div className="mx-auto h-40 w-40 rounded-2xl bg-white" style={{ boxShadow: css }} />
      </div>

      <div className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
        <code className="flex-1 truncate font-mono text-xs text-graphite">{full}</code>
        <button onClick={() => navigator.clipboard.writeText(full)} className="inline-flex items-center gap-1 rounded border border-line px-3 py-1.5 font-mono text-xs hover:bg-paper-2"><Copy className="h-3.5 w-3.5" /> Copy</button>
      </div>
    </ToolShell>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="rounded-md border border-line bg-white p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">{label}</p>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full" />
    </label>
  );
}
