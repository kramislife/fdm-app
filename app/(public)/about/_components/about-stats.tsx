import { communityStats } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";
import { Counter } from "@/components/shared/animations/counter";

export function AboutStats() {
  return (
    <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {communityStats.map((stat, i) => (
          <Reveal
            key={stat.label}
            direction="up"
            delay={i * 0.1}
            className="flex flex-col items-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-primary">
              <Counter value={stat.value} delay={i * 0.1} duration={1000} />
            </h2>
            <span className="text-sm md:text-base">{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
