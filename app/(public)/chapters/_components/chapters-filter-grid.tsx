"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChapterCard, type PublicChapter } from "@/components/chapters/chapter-card";
import { Reveal } from "@/components/shared/animations/reveal";
import { cn } from "@/lib/utils/utils";
import { capitalizeWords } from "@/lib/utils/format";

const ALL_REGIONS = "All Chapters";

interface ChaptersFilterGridProps {
  chapters: PublicChapter[];
}

export function ChaptersFilterGrid({ chapters }: ChaptersFilterGridProps) {
  const [activeRegion, setActiveRegion] = useState<string>(ALL_REGIONS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Derive unique regions from chapters that actually exist in the DB
  const regions = useMemo(() => {
    const unique = Array.from(
      new Set(
        chapters
          .map((c) => c.region?.trim())
          .filter((r): r is string => Boolean(r)),
      ),
    ).sort();
    return [ALL_REGIONS, ...unique];
  }, [chapters]);

  // Count chapters per region
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chapters.forEach((c) => {
      const r = c.region?.trim();
      if (r) counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [chapters]);

  const filtered = useMemo(
    () =>
      activeRegion === ALL_REGIONS
        ? chapters
        : chapters.filter((c) => c.region?.trim() === activeRegion),
    [chapters, activeRegion],
  );

  const handleFilter = (region: string) => {
    if (region === activeRegion) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveRegion(region);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <>
      {/* ----------------------------- Filter Bar ----------------------------- */}
      <section className="px-5">
        <div className="flex flex-wrap gap-2">
          {regions.map((region, i) => (
            <Reveal
              key={region}
              direction="none"
              delay={i * 0.05}
              immediate
              duration={300}
            >
              <Button
                variant={activeRegion === region ? "default" : "outline"}
                className="px-5 rounded-full flex items-center justify-center transition-all active:scale-95 text-xs md:text-sm"
                onClick={() => handleFilter(region)}
              >
                {region === ALL_REGIONS ? region : capitalizeWords(region)}
                {region !== ALL_REGIONS && (
                  <span className="mt-0.5 text-xs opacity-60">
                    ({regionCounts[region]})
                  </span>
                )}
              </Button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------- Chapters Grid ----------------------------- */}
      <section className="px-5 py-10 md:px-10 min-h-[400px]">
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-300",
            isTransitioning ? "opacity-0" : "opacity-100",
          )}
        >
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground py-20">
              No chapters found in this area yet.
            </p>
          ) : (
            filtered.map((chapter, i) => (
              <Reveal
                key={`${activeRegion}-${chapter.id}`}
                direction="up"
                delay={(i % 6) * 0.1}
                duration={500}
                className="flex-1"
              >
                <ChapterCard chapter={chapter} />
              </Reveal>
            ))
          )}
        </div>
      </section>
    </>
  );
}
