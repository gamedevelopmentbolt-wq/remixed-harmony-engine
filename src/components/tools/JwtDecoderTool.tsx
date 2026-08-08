import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { GhostButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

function b64urlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    throw new Error("Invalid base64url segment");
  }
}

export function JwtDecoderTool() {
  const tool = tools.find((t) => t.slug === "jwt-decoder")!;
  const [token, setToken] = useState("");
  const [status] = useState<ToolStatus>({ kind: "idle" });

  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length < 2) return { error: "A JWT has three segments separated by dots (header.payload.signature)." };
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const sig = parts[2] ?? "";
      let expiry: string | null = null;
      if (typeof payload.exp === "number") {
        const d = new Date(payload.exp * 1000);
        expiry = `${d.toISOString()} — ${d.getTime() < Date.now() ? "EXPIRED" : "valid"}`;
      }
      return { header, payload, sig, expiry };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Failed to decode." };
    }
  }, [token]);

  const copy = async (v: string) => { await navigator.clipboard.writeText(v); };

  return (
    <ToolShell tool={tool} status={status}
      howItWorks={[
        "Paste a JSON Web Token (JWT) into the box.",
        "The header and payload are base64url-decoded and pretty-printed in your browser.",
        "Signatures are shown but NOT verified — a JWT decoder never proves authenticity.",
      ]}>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">JWT</span>
        <textarea value={token} onChange={(e) => setToken(e.target.value)} rows={5}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.xxxxx"
          className="mt-2 block w-full rounded-md border border-line bg-white p-3 font-mono text-xs focus:border-ink focus:outline-none" />
      </label>

      {result && "error" in result && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 font-mono text-sm text-destructive">{result.error}</p>
      )}

      {result && !("error" in result) && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Header</span>
              <button onClick={() => copy(JSON.stringify(result.header, null, 2))} className="font-mono text-[11px] text-signal"><Copy className="inline h-3 w-3" /> Copy</button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md border border-line bg-paper-2 p-3 font-mono text-xs">{JSON.stringify(result.header, null, 2)}</pre>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">Payload</span>
              <button onClick={() => copy(JSON.stringify(result.payload, null, 2))} className="font-mono text-[11px] text-signal"><Copy className="inline h-3 w-3" /> Copy</button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md border border-line bg-paper-2 p-3 font-mono text-xs">{JSON.stringify(result.payload, null, 2)}</pre>
          </div>
          {result.expiry && (
            <p className="md:col-span-2 rounded-md border border-line bg-white p-3 font-mono text-xs text-ink">
              <strong>exp:</strong> {result.expiry}
            </p>
          )}
          <div className="md:col-span-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink">Signature (not verified)</span>
            <p className="mt-2 break-all rounded-md border border-line bg-paper-2 p-3 font-mono text-xs">{result.sig || "(none)"}</p>
          </div>
        </div>
      )}

      <GhostButton onClick={() => setToken("")}>Clear</GhostButton>
    </ToolShell>
  );
}
