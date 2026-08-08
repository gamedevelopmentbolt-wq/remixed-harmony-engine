import { ArrowDown, ArrowUp, X } from "lucide-react";
import { formatBytes } from "@/lib/tool-utils";

interface FileListProps {
  files: File[];
  onRemove?: (i: number) => void;
  onMove?: (from: number, to: number) => void;
}

export function FileList({ files, onRemove, onMove }: FileListProps) {
  if (files.length === 0) return null;
  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-white">
      {files.map((f, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-paper-2 font-mono text-[11px] font-bold text-ink">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm text-ink">{f.name}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-graphite/60">
              {formatBytes(f.size)}
            </p>
          </div>
          {onMove && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onMove(i, i - 1)}
                disabled={i === 0}
                aria-label="Move up"
                className="grid h-8 w-8 place-items-center rounded-md border border-line text-graphite hover:border-ink disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMove(i, i + 1)}
                disabled={i === files.length - 1}
                aria-label="Move down"
                className="grid h-8 w-8 place-items-center rounded-md border border-line text-graphite hover:border-ink disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${f.name}`}
              className="grid h-8 w-8 place-items-center rounded-md border border-line text-graphite hover:border-signal hover:text-signal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
