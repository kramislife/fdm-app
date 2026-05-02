import { missionContent } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";
import { MissionCarouselWrapper } from "./mission-carousel-wrapper";

export function AboutMission() {
  return (
    <section className="px-5 py-10 md:px-10 md:py-20 overflow-hidden">
      <Reveal
        direction="up"
        className="mx-auto mb-10 max-w-4xl space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[5px] text-primary">
            {missionContent.eyebrow}
          </p>
          <span className="h-px w-10 bg-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold md:text-3xl lg:text-4xl">
          {missionContent.title}
        </h2>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          {missionContent.description}
        </p>
      </Reveal>

      <MissionCarouselWrapper />
    </section>
  );
}
