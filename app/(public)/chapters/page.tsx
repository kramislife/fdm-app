"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

import { ChapterCard } from "@/components/chapters/chapter-card";

import { chaptersContent } from "@/config/about";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const ALL_AREAS = "All Chapters";

export default function ChaptersPage() {
  const [activeArea, setActiveArea] = useState<string>(ALL_AREAS);

  const { fadeIn, fadeInUp, staggerContainer, getAnimationProps } =
    useScrollAnimation();

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

  return (
    <main className="overflow-x-hidden">
      {/* ----------------------------- Hero ----------------------------- */}
      <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20 mb-10">
        <motion.div
          className="space-y-5 text-center"
          {...getAnimationProps(fadeInUp)}
          animate="whileInView"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
            {chaptersContent.title}
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            {chaptersContent.description}
          </p>
        </motion.div>
      </section>

      {/* ----------------------------- Filter Bar ----------------------------- */}
      <section className="px-5">
        <motion.div
          className="flex flex-wrap gap-2"
          {...getAnimationProps(fadeIn)}
          animate="whileInView"
        >
          {areas.map((area) => (
            <Button
              key={area}
              variant={activeArea === area ? "default" : "outline"}
              className="px-5 rounded-full flex items-center justify-center"
              onClick={() => setActiveArea(area)}
            >
              {area}
              {area !== ALL_AREAS && (
                <span className="mt-0.5 text-xs opacity-60">
                  ({areaCounts[area]})
                </span>
              )}
            </Button>
          ))}
        </motion.div>
      </section>

      {/* ----------------------------- Chapters Grid ----------------------------- */}
      <section className="px-5 py-10 md:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArea}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="initial"
            animate="whileInView"
            viewport={{ once: true }}
          >
            {filtered.length === 0 ? (
              <motion.p
                className="col-span-full text-center text-sm text-muted-foreground py-20"
                variants={fadeInUp}
              >
                No chapters found in this area yet.
              </motion.p>
            ) : (
              filtered.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  variants={fadeInUp}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
