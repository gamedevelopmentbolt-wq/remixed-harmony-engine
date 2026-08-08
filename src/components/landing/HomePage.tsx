import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturedTools } from "@/components/landing/FeaturedTools";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { ToolGrid } from "@/components/landing/ToolGrid";
import { WhySection } from "@/components/landing/WhySection";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { AdSlot } from "@/components/AdSlot";
import { I18nProvider, LOCALE_META, type Locale } from "@/lib/i18n";
import type { ToolCategory } from "@/lib/tools";

/** Locale-aware home page shared by /, /fr, /es and /ar. */
export function HomePage({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">("All");
  const meta = LOCALE_META[locale];

  return (
    <I18nProvider locale={locale}>
      <div dir={meta.dir} lang={meta.tag} className="min-h-screen bg-paper text-graphite">
        <Header />
        <main>
          <Hero query={query} onQueryChange={setQuery} onCategorySelect={setCategory} />
          <FeaturedTools />
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <AdSlot className="flex justify-center" />
          </div>
          <CategoryGrid />
          <ToolGrid query={query} activeCategory={category} onCategoryChange={setCategory} />
          <WhySection />
          <StatsStrip />
          <Testimonials />
          <FAQ />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
