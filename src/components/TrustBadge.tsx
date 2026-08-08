import { ShieldCheck } from "lucide-react";

interface Props {
  variant?: "compact" | "full";
  className?: string;
}

const claims = [
  "No watermark",
  "No daily limit",
  "No signup",
  "Files never leave your device",
];

export function TrustBadge({ variant = "compact", className = "" }: Props) {
  if (variant === "full") {
    return (
      <div
        className={
          "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full border border-workshop/40 bg-workshop/5 px-4 py-2 " +
          className
        }
      >
        <ShieldCheck aria-hidden className="h-4 w-4 text-workshop" />
        {claims.map((c, i) => (
          <span key={c} className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-workshop">
              {c}
            </span>
            {i < claims.length - 1 && (
              <span aria-hidden className="h-1 w-1 rounded-full bg-workshop/40" />
            )}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div
      className={
        "hidden items-center gap-2 rounded-full border border-workshop/40 bg-workshop/5 px-3 py-1.5 xl:inline-flex " +
        className
      }
      title="No watermark · No daily limit · No signup · Files never leave your device"
    >
      <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-workshop" />
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-workshop">
        No watermark · No limits · No signup
      </span>
    </div>
  );
}
