import { heroContent } from "@/config/contact";
import { Reveal } from "@/components/shared/animations/reveal";

export function ContactHero() {
  return (
    <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
      <Reveal direction="up" immediate className="space-y-5 text-center">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
          {heroContent.title}
        </h1>

        <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
          {heroContent.description}
        </p>
      </Reveal>
    </section>
  );
}
