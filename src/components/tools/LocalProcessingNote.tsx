import { Cpu, Cloud } from "lucide-react";

interface Props {
  network?: boolean;
}

export function LocalProcessingNote({ network }: Props) {
  if (network) {
    return (
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-white/70 px-3 py-2">
        <Cloud aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
        <p className="font-mono text-[11px] uppercase tracking-wider text-graphite">
          Runs in your browser after a one-time model download. Your files stay on your device.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-workshop/40 bg-workshop/5 px-3 py-2">
      <Cpu aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-workshop" />
      <p className="font-mono text-[11px] uppercase tracking-wider text-workshop">
        Processed 100% in your browser — your files never leave your device.
      </p>
    </div>
  );
}
