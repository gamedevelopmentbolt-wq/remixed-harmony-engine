/**
 * Google Publisher Tag ad slot. Renders the div GPT is configured to fill
 * and pushes the display call on mount. The slot definition itself is
 * assumed to be defined by GPT config elsewhere (e.g. a network-managed
 * template); we only host the container and trigger display.
 */
import { useEffect } from "react";

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      display?: (id: string) => void;
    };
  }
}

const SLOT_ID = "div-gpt-ad-1748251437563-0";

export function AdSlot({ className }: { className?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(function () {
      try {
        window.googletag?.display?.(SLOT_ID);
      } catch {
        /* no-op */
      }
    });
  }, []);

  return (
    <div className={className} aria-label="Advertisement" role="complementary">
      {/* Reserve the slot box up-front so a late-filling ad cannot shift the
          tool grid below it (CLS). */}
      <div id={SLOT_ID} style={{ minWidth: 320, minHeight: 100 }} />
    </div>
  );
}
