import { useEffect, useState } from "react";
import { RefreshCw, Copy } from "lucide-react";
import { GhostButton, PrimaryButton, ToolShell, type ToolStatus } from "./ToolShell";
import { tools } from "@/lib/tools";

const SET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const SET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SET_DIGITS = "0123456789";
const SET_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
const AMBIG = /[Il1O0o]/g;

function randomFrom(set: string) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return set[arr[0] % set.length];
}
function shuffle(s: string) {
  const arr = s.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = new Uint32Array(1);
    crypto.getRandomValues(j);
    const k = j[0] % (i + 1);
    [arr[i], arr[k]] = [arr[k], arr[i]];
  }
  return arr.join("");
}

function generate(opts: {
  length: number; upper: boolean; lower: boolean; digits: boolean;
  symbols: boolean; excludeAmbig: boolean;
}) {
  const sets: string[] = [];
  if (opts.lower) sets.push(SET_LOWER);
  if (opts.upper) sets.push(SET_UPPER);
  if (opts.digits) sets.push(SET_DIGITS);
  if (opts.symbols) sets.push(SET_SYMBOLS);
  const cleaned = sets.map((s) => (opts.excludeAmbig ? s.replace(AMBIG, "") : s)).filter(Boolean);
  if (cleaned.length === 0) return "";
  // guarantee at least one of each selected set
  const required = cleaned.map(randomFrom);
  const pool = cleaned.join("");
  const rest = Array.from({ length: Math.max(0, opts.length - required.length) }, () => randomFrom(pool));
  return shuffle([...required, ...rest].join(""));
}

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong", "Excellent"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

export function PasswordGeneratorTool() {
  const tool = tools.find((t) => t.slug === "password-generator")!;
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbig, setExcludeAmbig] = useState(false);
  const [pw, setPw] = useState("");
  const [status, setStatus] = useState<ToolStatus>({ kind: "idle" });

  const regen = () => {
    const next = generate({ length, upper, lower, digits, symbols, excludeAmbig });
    if (!next) {
      setStatus({ kind: "error", message: "Pick at least one character set." });
      setPw("");
      return;
    }
    setStatus({ kind: "idle" });
    setPw(next);
  };

  // initial + on option change
  useEffect(() => { regen(); /* eslint-disable-next-line */ }, [length, upper, lower, digits, symbols, excludeAmbig]);

  const copy = async () => {
    if (!pw) return;
    await navigator.clipboard.writeText(pw);
    setStatus({ kind: "success", message: "Copied to clipboard." });
  };

  const st = strength(pw);
  const bars = Math.min(6, st.score);

  return (
    <ToolShell
      tool={tool}
      status={status}
      howItWorks={[
        "Choose length and which character sets to include.",
        "A cryptographically-random password is generated in your browser using crypto.getRandomValues.",
        "Copy it, or click regenerate for a fresh one. Nothing is stored.",
      ]}
    >
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-md bg-paper-2 p-3 font-mono text-base text-ink">
            {pw || "—"}
          </code>
          <PrimaryButton onClick={regen} className="!h-11 !min-w-0"><RefreshCw className="h-4 w-4" />New</PrimaryButton>
          <GhostButton onClick={copy} disabled={!pw}><Copy className="h-4 w-4" />Copy</GhostButton>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 flex-1 rounded-full " +
                  (i < bars ? (bars >= 5 ? "bg-workshop" : bars >= 3 ? "bg-signal" : "bg-graphite/50") : "bg-line")
                }
              />
            ))}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">{st.label}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Length: {length}</span>
          <input
            type="range" min={4} max={64} value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-2 block w-full"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Uppercase A–Z", upper, setUpper],
            ["Lowercase a–z", lower, setLower],
            ["Digits 0–9", digits, setDigits],
            ["Symbols !@#…", symbols, setSymbols],
            ["Exclude ambiguous (I l 1 O 0)", excludeAmbig, setExcludeAmbig],
          ].map(([label, val, setter]) => (
            <label key={label as string} className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2">
              <input
                type="checkbox" checked={val as boolean}
                onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
              />
              <span className="font-mono text-xs">{label as string}</span>
            </label>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
