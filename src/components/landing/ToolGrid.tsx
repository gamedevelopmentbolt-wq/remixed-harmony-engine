import { Link } from "@tanstack/react-router";
import {
  Files, Scissors, Minimize2, FileImage, FileType2,
  ImageDown, Repeat, QrCode, ArrowLeftRight, Archive,
  ScanText, FileText, Eraser, PenLine, Lock, FileVideo,
  RotateCw, Crop, ImagePlus, Presentation, Hash,
  Stamp, ListOrdered, Barcode, Palette, FileType,
  Pencil, Smile, Braces, Binary, Film, Languages,
  IdCard, Layers, FileSearch, Receipt, Cake, UserRound, Scale, Contact,
  Coins, ImageOff, Ruler, Droplet, Signature,
  ScanLine, Type, CaseSensitive, Pipette, KeyRound, Link2, Clock,
  FileCode2, TextQuote, GitCompare, Fingerprint, Regex,
  AlignJustify, Link as LinkIcon, ShieldCheck, FileJson, FileCode, ShieldOff,
  Sigma, Dices, HeartPulse, Landmark, Repeat2, Code2,

  type LucideIcon,
} from "lucide-react";
import { tools, categories, type ToolCategory } from "@/lib/tools";
import { fmt, useI18n } from "@/lib/i18n";

export const iconMap: Record<string, LucideIcon> = {
  Files, Scissors, Minimize2, FileImage, FileType2,
  ImageDown, Repeat, QrCode, ArrowLeftRight, Archive,
  ScanText, FileText, Eraser, PenLine, Lock, FileVideo,
  RotateCw, Crop, ImagePlus, Presentation, Hash,
  Stamp, ListOrdered, Barcode, Palette, FileType,
  Pencil, Smile, Braces, Binary, Film, Languages,
  IdCard, Layers, FileSearch, Receipt, Cake, UserRound, Scale, Contact,
  Coins, ImageOff, Ruler, Droplet, Signature,
  ScanLine, Type, CaseSensitive, Pipette, KeyRound, Link2, Clock,
  FileCode2, TextQuote, GitCompare, Fingerprint, Regex,
  AlignJustify, Link: LinkIcon, ShieldCheck, FileJson, FileCode, ShieldOff,
  Sigma, Dices, HeartPulse, Landmark, Repeat2, Code2,

};

interface ToolGridProps {
  query: string;
  activeCategory: ToolCategory | "All";
  onCategoryChange: (c: ToolCategory | "All") => void;
}

export function ToolGrid({ query, activeCategory, onCategoryChange }: ToolGridProps) {
  const { t } = useI18n();
  const q = query.trim().toLowerCase();
  const filtered = tools.filter((tool) => {
    const catOk = activeCategory === "All" || tool.category === activeCategory;
    const qOk = !q || tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
    return catOk && qOk;
  });

  return (
    <section id="tools" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-graphite/60">{t.toolGrid.section}</p>
            <h2 className="mt-2 font-mono text-2xl font-bold text-ink sm:text-3xl">{t.toolGrid.heading}</h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-graphite/60">
            {fmt(t.toolGrid.shown, { shown: filtered.length.toString().padStart(2, "0"), total: tools.length })}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c.key === activeCategory;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onCategoryChange(c.key)}
                aria-pressed={active}
                className={
                  "inline-flex h-8 items-center rounded-full border px-3 font-mono text-[11px] uppercase tracking-wider transition " +
                  (active
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-graphite/80 hover:border-ink/60 hover:text-ink")
                }
              >
                {t.toolGrid.filters[c.key] ?? c.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/50 p-10 text-center">
            <p className="font-mono text-sm text-graphite/70">{fmt(t.toolGrid.noMatch, { query })}</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => {
              const Icon = iconMap[tool.icon] ?? Files;
              return (
                <li key={tool.slug} className="pegboard-card flex flex-col">
                  <div className="mt-3 flex items-start justify-between">
                    <span
                      aria-hidden
                      className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-paper-2 text-ink"
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-graphite/50">
                      {tool.category}
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                    {t.toolGrid.toolLabel} · {tool.n}
                  </p>
                  <h3 className="mt-1 font-mono text-lg font-bold text-ink">{tool.name}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-graphite/80">{tool.description}</p>
                  {tool.network && (
                    <p className="mt-2 inline-flex w-fit items-center rounded-full border border-line bg-paper-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite/70">
                      {t.toolGrid.modelNote}
                    </p>
                  )}
                  <Link
                    to="/tools/$slug"
                    params={{ slug: tool.slug }}
                    className="mt-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-ink hover:text-signal"
                  >
                    {t.toolGrid.open} <span aria-hidden className="inline-block rtl:rotate-180">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
