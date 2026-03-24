"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChapterCard } from "@/components/chapters/chapter-card";
import { chaptersContent } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";
import { cn } from "@/lib/utils/utils";

const ALL_AREAS = "All Chapters";

export function ChaptersFilterGrid() {
  const [activeArea, setActiveArea] = useState<string>(ALL_AREAS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Derive unique area labels from chapter data
  const areas = useMemo(() => {
    const unique = Array.from(
      new Set(chaptersContent.items.map((c) => c.location)),
    );
    return [ALL_AREAS, ...unique];
  }, []);

  // Calculate counts for each area
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chaptersContent.items.forEach((item) => {
      counts[item.location] = (counts[item.location] || 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(
    () =>
      activeArea === ALL_AREAS
        ? chaptersContent.items
        : chaptersContent.items.filter((c) => c.location === activeArea),
    [activeArea],
  );

  const handleFilter = (area: string) => {
    if (area === activeArea) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveArea(area);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <>
      {/* ----------------------------- Filter Bar ----------------------------- */}
      <section className="px-5">
        <div className="flex flex-wrap gap-2">
          {areas.map((area, i) => (
            <Reveal
              key={area}
              direction="none"
              delay={i * 0.05}
              immediate
              duration={300}
            >
              <Button
                variant={activeArea === area ? "default" : "outline"}
                className="px-5 rounded-full flex items-center justify-center h-10 transition-all active:scale-95"
                onClick={() => handleFilter(area)}
              >
                {area}
                {area !== ALL_AREAS && (
                  <span className="ml-1 mt-0.5 text-xs opacity-60">
                    ({areaCounts[area]})
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
            "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 transition-opacity duration-300",
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
                key={`${activeArea}-${chapter.id}`}
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
