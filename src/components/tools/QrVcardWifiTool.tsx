import { useEffect, useRef, useState } from "react";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { downloadBlob } from "@/lib/tool-utils";

type Mode = "vcard" | "wifi" | "upi";

function esc(s: string) { return s.replace(/([\\;,])/g, "\\$1"); }

export function QrVcardWifiTool() {
  const tool = tools.find((t) => t.slug === "qr-vcard-wifi")!;
  const [mode, setMode] = useState<Mode>("vcard");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });
  const [v, setV] = useState({ name: "", org: "", phone: "", email: "", url: "" });
  const [w, setW] = useState({ ssid: "", pass: "", enc: "WPA", hidden: false });
  const [u, setU] = useState({ pa: "", pn: "", am: "", cu: "PKR" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svg, setSvg] = useState("");

  const payload = () => {
    if (mode === "vcard") return `BEGIN:VCARD\nVERSION:3.0\nFN:${v.name}\nORG:${v.org}\nTEL:${v.phone}\nEMAIL:${v.email}\nURL:${v.url}\nEND:VCARD`;
    if (mode === "wifi") return `WIFI:T:${w.enc};S:${esc(w.ssid)};P:${esc(w.pass)};${w.hidden ? "H:true;" : ""};`;
    return `upi://pay?pa=${encodeURIComponent(u.pa)}&pn=${encodeURIComponent(u.pn)}&am=${encodeURIComponent(u.am)}&cu=${encodeURIComponent(u.cu)}`;
  };

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const QR = await import("qrcode");
        const data = payload();
        if (!data.trim() || cancel) return;
        if (canvasRef.current) await QR.toCanvas(canvasRef.current, data, { width: 320, margin: 2, errorCorrectionLevel: "M" });
        const s = await QR.toString(data, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
        if (!cancel) setSvg(s);
      } catch { /* ignore */ }
    })();
    return () => { cancel = true; };
  }, [mode, v, w, u]); // eslint-disable-line react-hooks/exhaustive-deps

  const downloadPng = () => canvasRef.current?.toBlob((b) => b && downloadBlob(b, "qr.png"));
  const downloadSvg = () => downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr.svg");

  const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className="w-full rounded border border-line bg-white p-2 font-mono text-sm" />;

  return (
    <ToolShell tool={tool} status={status} howItWorks={[
      "Pick vCard (contact), WiFi credentials, or UPI-style payment.",
      "Fill the fields — the QR preview updates live.",
      "Download as PNG (for prints/photos) or SVG (for logos and posters).",
    ]}>
      <div className="flex flex-wrap gap-2">
        {(["vcard", "wifi", "upi"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={"rounded-full border px-4 py-1 font-mono text-xs uppercase tracking-wider " + (mode === m ? "border-ink bg-ink text-paper" : "border-line bg-white text-graphite")}>{m === "vcard" ? "vCard" : m === "wifi" ? "WiFi" : "Payment"}</button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {mode === "vcard" && <>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Full name</span><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Company</span><Input value={v.org} onChange={(e) => setV({ ...v, org: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Phone</span><Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Email</span><Input value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Website</span><Input value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} /></label>
          </>}
          {mode === "wifi" && <>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Network name (SSID)</span><Input value={w.ssid} onChange={(e) => setW({ ...w, ssid: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Password</span><Input value={w.pass} onChange={(e) => setW({ ...w, pass: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Encryption</span>
              <select value={w.enc} onChange={(e) => setW({ ...w, enc: e.target.value })} className="mt-1 w-full rounded border border-line bg-white p-2 font-mono text-sm">
                <option>WPA</option><option>WEP</option><option value="nopass">None</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={w.hidden} onChange={(e) => setW({ ...w, hidden: e.target.checked })} />Hidden network</label>
          </>}
          {mode === "upi" && <>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Payment address (VPA / ID)</span><Input value={u.pa} onChange={(e) => setU({ ...u, pa: e.target.value })} placeholder="name@bank" /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Payee name</span><Input value={u.pn} onChange={(e) => setU({ ...u, pn: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Amount</span><Input value={u.am} onChange={(e) => setU({ ...u, am: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-mono text-xs uppercase text-ink">Currency</span><Input value={u.cu} onChange={(e) => setU({ ...u, cu: e.target.value })} /></label>
          </>}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-line bg-white p-4"><canvas ref={canvasRef} /></div>
          <div className="flex gap-2">
            <PrimaryButton onClick={downloadPng}>Download PNG</PrimaryButton>
            <button type="button" onClick={downloadSvg} className="inline-flex h-12 items-center rounded-md border border-ink px-5 font-mono text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper">SVG</button>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}