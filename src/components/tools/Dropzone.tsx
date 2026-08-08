import { useCallback, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Upload } from "lucide-react";

interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint?: string;
  children?: ReactNode;
}

const SOFT_LIMIT_BYTES = 300 * 1024 * 1024; // 300 MB

function formatMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(0);
}

export function Dropzone({ accept, multiple = true, onFiles, hint }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files);
      const oversized = arr.filter((f) => f.size > SOFT_LIMIT_BYTES);
      if (oversized.length > 0) {
        const biggest = oversized.reduce((a, b) => (a.size > b.size ? a : b));
        const msg =
          `Heads up: "${biggest.name}" is ${formatMB(biggest.size)} MB (over the 300 MB recommended limit).\n\n` +
          `Everything runs in your browser, so very large files can slow your device down or run out of memory. ` +
          `Continue anyway?`;
        if (typeof window !== "undefined" && !window.confirm(msg)) return;
      }
      onFiles(arr);
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer?.files ?? null);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer " +
        (drag ? "border-signal bg-signal/5" : "border-line bg-white hover:border-ink/60")
      }
    >
      <Upload aria-hidden className="h-8 w-8 text-ink" />
      <p className="font-mono text-sm font-bold text-ink">Drop files here or click to browse</p>
      {hint && <p className="text-xs text-graphite/70">{hint}</p>}
      <p className="text-[11px] text-graphite/60">No signup · No watermark · Files never leave your device · Up to ~300 MB recommended</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handle(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
