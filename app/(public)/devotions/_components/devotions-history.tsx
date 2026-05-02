import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";

import { Reveal } from "@/components/shared/animations/reveal";
import {
  devotionsHistory,
  devotionsHistoryHeader,
  faustinaProfile,
  type DevotionHistoryItem,
} from "@/config/devotions";

function EventCard({ item }: { item: DevotionHistoryItem }) {
  return (
    <Card>
      <CardHeader>
        {item.title && (
          <CardTitle className="text-lg md:text-xl font-bold uppercase mb-1">
            {item.title}
          </CardTitle>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          {item.date}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {item.quote && (
          <blockquote className="border-l-2 border-primary/20 pl-4 italic font-serif text-sm md:text-base leading-relaxed">
            {item.quote}
          </blockquote>
        )}
        <p className="text-sm leading-relaxed">{item.description}</p>
      </CardContent>
    </Card>
  );
}

function GhostYear({ year }: { year: string }) {
  return (
    <span className="font-serif font-black text-6xl md:text-7xl lg:text-8xl text-primary/20 tracking-tight">
      {year}
    </span>
  );
}

export function DevotionsHistory() {
  return (
    <section className="px-5 py-10 md:px-10 md:py-20 relative">
      {/* Header */}
      <Reveal
        direction="up"
        className="mx-auto mb-12 max-w-4xl space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[5px] text-primary">
            {devotionsHistoryHeader.badge}
          </p>
          <span className="h-px w-10 bg-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold md:text-3xl lg:text-4xl">
          {devotionsHistoryHeader.title}
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {devotionsHistoryHeader.description}
        </p>
      </Reveal>

      <div className="flex flex-col lg:flex-row gap-5 md:gap-10">
        {/* LEFT TIMELINE (alternating) */}
        <div className="flex-1 relative">
          {/* Vertical center line on md+; left line on mobile */}
          <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 top-3 bottom-3 w-px bg-primary/20" />

          <div className="space-y-10">
            {devotionsHistory.map((item, i) => {
              const isLeft = i % 2 === 0;

              return (
                <Reveal
                  key={i}
                  direction={isLeft ? "left" : "right"}
                  delay={i * 0.08}
                >
                  <div className="relative">
                    {/* Mobile dot */}
                    <div className="md:hidden absolute left-3 top-6 -translate-x-[5px] size-3 rounded-full bg-primary ring-4 ring-background" />

                    {/* Desktop center dot */}
                    <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <span className="block size-3 rounded-full bg-primary ring-4 ring-background" />
                    </div>

                    {/* Mobile: single column */}
                    <div className="md:hidden pl-10">
                      <div className="mb-10">
                        <GhostYear year={item.year} />
                      </div>
                      <EventCard item={item} />
                    </div>

                    {/* Desktop: alternating zigzag */}
                    <div className="hidden md:grid md:grid-cols-2 gap-20">
                      <div
                        className={cn(
                          "flex",
                          isLeft
                            ? "order-1 justify-end"
                            : "order-2 justify-start",
                        )}
                      >
                        <div className="w-full">
                          <EventCard item={item} />
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex items-center",
                          isLeft
                            ? "order-2 justify-start"
                            : "order-1 justify-end",
                        )}
                      >
                        <GhostYear year={item.year} />
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-[400px] shrink-0">
          <Card className="lg:sticky lg:top-24">
            <CardHeader className="flex flex-col items-center text-center">
              <div className="size-24 rounded-lg shadow-sm border overflow-hidden mb-5 p-1">
                <div className="relative w-full h-full rounded-md overflow-hidden">
                  <Image
                    src={faustinaProfile.image}
                    alt={faustinaProfile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <CardTitle className="font-serif text-xl text-primary font-bold">
                {faustinaProfile.name}
              </CardTitle>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {faustinaProfile.role}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 mt-5">
              {faustinaProfile.info.map(
                ({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-5">
                    <Icon className="size-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">{title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </CardContent>

            <CardFooter className="border-t border-border text-center">
              <p className="text-sm italic text-muted-foreground font-serif">
                &ldquo;{faustinaProfile.quote}&rdquo;
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
