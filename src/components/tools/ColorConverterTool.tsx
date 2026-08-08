import { useEffect, useState } from "react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace("#", "");
  const s = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (!/^[0-9a-f]{6}$/i.test(s)) return null;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function ColorConverterTool() {
  const tool = tools.find((t) => t.slug === "color-converter")!;
  const [hex, setHex] = useState("#3b82f6");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(...rgb) : null;

  const updateRgb = (r: number, g: number, b: number) => setHex(rgbToHex(r, g, b));
  const updateHsl = (h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l);
    setHex(rgbToHex(r, g, b));
  };

  const copy = async (val: string) => {
    await navigator.clipboard.writeText(val);
    setStatus({ kind: "success", message: `Copied ${val}` });
  };

  useEffect(() => { setStatus({ kind: "idle" }); }, [hex]);

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Pick a color, paste a HEX, or drag the RGB/HSL sliders.",
        "All three notations update together — HEX, RGB and HSL.",
        "Copy any format with one click.",
      ]}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="h-32 w-32 rounded-2xl border border-line shadow-sm"
          style={{ background: hex }}
        />
        <input
          type="color"
          value={rgb ? hex : "#000000"}
          onChange={(e) => setHex(e.target.value)}
          className="h-14 w-24 cursor-pointer rounded-md border border-line bg-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-signal">HEX</p>
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="mt-2 block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none"
          />
          <GhostButton className="mt-3 !h-9 !text-[11px]" onClick={() => copy(hex)}>Copy HEX</GhostButton>
        </div>
        {rgb && (
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-signal">RGB</p>
            <div className="mt-2 flex gap-2">
              {(["R", "G", "B"] as const).map((label, i) => (
                <label key={label} className="flex-1">
                  <span className="font-mono text-[10px] text-graphite">{label}</span>
                  <input
                    type="number" min={0} max={255} value={rgb[i]}
                    onChange={(e) => {
                      const nv = [...rgb] as [number, number, number];
                      nv[i] = Number(e.target.value);
                      updateRgb(...nv);
                    }}
                    className="block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <GhostButton className="mt-3 !h-9 !text-[11px]" onClick={() => copy(`rgb(${rgb.join(", ")})`)}>Copy RGB</GhostButton>
          </div>
        )}
        {hsl && (
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-signal">HSL</p>
            <div className="mt-2 flex gap-2">
              {(["H", "S", "L"] as const).map((label, i) => (
                <label key={label} className="flex-1">
                  <span className="font-mono text-[10px] text-graphite">{label}{i > 0 ? "%" : "°"}</span>
                  <input
                    type="number" min={0} max={i === 0 ? 360 : 100} value={hsl[i]}
                    onChange={(e) => {
                      const nv = [...hsl] as [number, number, number];
                      nv[i] = Number(e.target.value);
                      updateHsl(...nv);
                    }}
                    className="block w-full rounded-md border border-line bg-white p-2 font-mono text-sm focus:border-ink focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <GhostButton className="mt-3 !h-9 !text-[11px]" onClick={() => copy(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)}>Copy HSL</GhostButton>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
