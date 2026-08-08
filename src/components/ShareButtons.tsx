import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

interface Props {
  url: string; // absolute URL
  title: string;
  /** Optional short text for platforms that support it (e.g. WhatsApp) */
  text?: string;
}

// Small, no-tracker share bar. Uses each platform's public share URL —
// no third-party script is loaded.
export function ShareButtons({ url, title, text }: Props) {
  const [copied, setCopied] = useState(false);
  const encUrl = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);
  const encText = encodeURIComponent(text ?? title);

  const items: { label: string; href: string }[] = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}` },
    { label: "WhatsApp", href: `https://api.whatsapp.com/send?text=${encText}%20${encUrl}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share">
      <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/60">Share</span>
      {items.map((i) => (
        <a
          key={i.label}
          href={i.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 font-mono text-[11px] uppercase tracking-widest text-graphite hover:border-ink"
          aria-label={`Share on ${i.label}`}
        >
          {i.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 font-mono text-[11px] uppercase tracking-widest text-graphite hover:border-ink"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check aria-hidden className="h-3 w-3" /> Copied
          </>
        ) : (
          <>
            <LinkIcon aria-hidden className="h-3 w-3" /> Copy link
          </>
        )}
      </button>
    </div>
  );
}