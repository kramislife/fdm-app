"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/animations/reveal";
import {
  InteractiveImageAccordion,
  type AccordionItemData,
} from "@/components/ui/interactive-image-accordion";

import { devotions } from "@/config/devotions";

export function DevotionsHero() {
  const devotion = devotions[0];
  const items: AccordionItemData[] = devotion.parts.map((part) => ({
    id: part.id,
    title: part.title,
    imageUrl: part.imageUrl,
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const activePart = devotion.parts[activeIndex];

  return (
    <section className="px-5 py-10 md:px-10 md:py-20">
      <div className="flex flex-col md:flex-row items-center gap-5">
        {/* Left: Dynamic text driven by active card */}
        <Reveal direction="left" className="w-full md:w-1/2">
          <div className="space-y-5 text-center md:text-left">
            <Badge
              variant="outline"
              className="gap-2 py-3 uppercase tracking-widest text-primary"
            >
              <span className="h-2 w-2 rounded-full bg-primary mb-0.5" />
              {devotion.title}
            </Badge>

            <div
              key={activePart.id}
              className="space-y-3 animate-in fade-in slide-in-from-left-5 duration-600"
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
                {activePart.title}
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {activePart.description}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Right: Accordion */}
        <div className="w-full md:w-1/2">
          <Reveal direction="right" delay={0.20}>
            <InteractiveImageAccordion
              items={items}
              defaultActiveIndex={0}
              onActiveChange={setActiveIndex}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
