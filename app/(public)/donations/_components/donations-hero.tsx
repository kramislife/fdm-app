import { Heart } from "lucide-react";
import { heroContent } from "@/config/donations";
import { Reveal } from "@/components/shared/animations/reveal";
import { Badge } from "@/components/ui/badge";

export function DonationsHero() {
  return (
    <section
      className="relative overflow-hidden px-5 py-10 md:px-10 md:py-20"
      style={{
        background:
          "linear-gradient(150deg, #1A0707 0%, #5C1414 60%, #2A0808 100%)",
      }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-40 -right-28 size-[500px] rounded-full bg-white/6" />
      <div className="pointer-events-none absolute top-14 -left-20 size-[260px] rounded-full bg-white/5" />

      <Reveal
        direction="up"
        immediate
        className="relative z-10 mx-auto max-w-2xl space-y-5 text-center"
      >
        {/* Gold tag */}
        <Badge className="inline-flex items-center gap-2 bg-white/20 p-4">
          <Heart className="size-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400">
            Friends of the Divine Mercy
          </span>
        </Badge>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-white">
          {heroContent.title}
        </h1>

        <p className="text-sm md:text-base leading-relaxed text-white/70 max-w-2xl mx-auto">
          {heroContent.description}
        </p>
      </Reveal>
    </section>
  );
}
