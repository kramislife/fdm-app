import { missionContent } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";
import { MissionCarouselWrapper } from "./mission-carousel-wrapper";

export function AboutMission() {
  return (
    <section className="px-5 py-10 md:px-10 md:py-20 overflow-hidden">
      <Reveal className="mx-auto max-w-5xl space-y-5 text-center">
        <p className="text-xs font-bold uppercase text-primary">
          {missionContent.eyebrow}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
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
