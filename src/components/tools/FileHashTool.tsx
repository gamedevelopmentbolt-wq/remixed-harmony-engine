import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";
import { formatBytes } from "@/lib/tool-utils";

interface HashSet {
  md5: string;
  sha1: string;
  sha256: string;
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

// Minimal MD5 (public-domain style implementation, chunked)
async function md5Hex(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  return md5(buf);
}

function md5(bytes: Uint8Array): string {
  // Based on RFC 1321 reference. Small, unoptimized.
  const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;

  const origLen = bytes.length;
  const bitLen = BigInt(origLen) * 8n;
  const withPadLen = (Math.floor((origLen + 8) / 64) + 1) * 64;
  const msg = new Uint8Array(withPadLen);
  msg.set(bytes);
  msg[origLen] = 0x80;
  const dv = new DataView(msg.buffer);
  dv.setUint32(withPadLen - 8, Number(bitLen & 0xffffffffn), true);
  dv.setUint32(withPadLen - 4, Number((bitLen >> 32n) & 0xffffffffn), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const M = new Uint32Array(16);
  for (let off = 0; off < withPadLen; off += 64) {
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(off + j * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      const sh = s[i];
      B = (B + ((F << sh) | (F >>> (32 - sh)))) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }
  const out = new ArrayBuffer(16);
  const outDv = new DataView(out);
  outDv.setUint32(0, a0, true);
  outDv.setUint32(4, b0, true);
  outDv.setUint32(8, c0, true);
  outDv.setUint32(12, d0, true);
  return toHex(out);
}

export function FileHashTool() {
  const tool = tools.find((t) => t.slug === "file-hash")!;
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<HashSet | null>(null);
  const [copied, setCopied] = useState<string>("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const run = async () => {
    if (!file) return;
    try {
      setHashes(null);
      setStatus({ kind: "working", message: "Reading file…", progress: 10 });
      const buf = await file.arrayBuffer();
      setStatus({ kind: "working", message: "Computing SHA-256…", progress: 30 });
      const sha256 = toHex(await crypto.subtle.digest("SHA-256", buf));
      setStatus({ kind: "working", message: "Computing SHA-1…", progress: 55 });
      const sha1 = toHex(await crypto.subtle.digest("SHA-1", buf));
      setStatus({ kind: "working", message: "Computing MD5…", progress: 80 });
      const md5 = await md5Hex(file);
      setHashes({ md5, sha1, sha256 });
      setStatus({ kind: "success", message: "All three checksums computed locally." });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Could not read this file." });
    }
  };

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  };

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Drop any file — of any type or size your device can hold in memory.",
        "MD5, SHA-1 and SHA-256 hashes are computed entirely in your browser.",
        "Copy any hash to compare against a checksum published by the file's source.",
      ]}
    >
      {!file ? (
        <Dropzone multiple={false} onFiles={(fs) => setFile(fs[0] ?? null)} hint="Any file type" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink">
            {file.name} · <span className="text-graphite/70">{formatBytes(file.size)}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setHashes(null);
              setStatus({ kind: "idle" });
            }}
            className="font-mono text-xs uppercase tracking-wider text-graphite/70 hover:text-ink"
          >
            Choose another
          </button>
        </div>
      )}

      <PrimaryButton onClick={run} disabled={!file || status.kind === "working"}>
        Compute checksums
      </PrimaryButton>

      {hashes && (
        <ul className="divide-y divide-line rounded-xl border border-line bg-white">
          {(["md5", "sha1", "sha256"] as const).map((k) => (
            <li key={k} className="flex items-center gap-3 px-4 py-3">
              <span className="w-20 shrink-0 font-mono text-[11px] font-bold uppercase tracking-widest text-signal">
                {k === "sha1" ? "SHA-1" : k === "sha256" ? "SHA-256" : "MD5"}
              </span>
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{hashes[k]}</code>
              <button
                type="button"
                onClick={() => copy(k, hashes[k])}
                aria-label={`Copy ${k}`}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-3 font-mono text-[11px] uppercase tracking-wider text-graphite hover:border-ink"
              >
                {copied === k ? <Check className="h-3.5 w-3.5 text-workshop" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === k ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </ToolShell>
  );
}
