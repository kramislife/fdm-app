import { Reveal } from "@/components/shared/animations/reveal";
import {
  abcOfMercy,
  abcOfMercyHeader,
  type AbcOfMercyItem,
} from "@/config/devotions";

function AbcItem({ item, delay }: { item: AbcOfMercyItem; delay: number }) {
  const firstLetter = item.title.charAt(0);
  const restOfTitle = item.title.slice(1);

  return (
    <Reveal direction="up" delay={delay}>
      <div className="group flex flex-col space-y-5">
        <div className="flex items-baseline overflow-hidden">
          <span className="text-6xl sm:text-7xl md:text-[80px] lg:text-[100px] font-black text-primary leading-none transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1 origin-bottom drop-shadow-sm">
            {firstLetter}
          </span>
          <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground uppercase pl-1">
            {restOfTitle}
          </span>
        </div>
        <p className="text-sm sm:text-lg md:text-xl leading-relaxed text-muted-foreground border-l-4 border-primary/20 pl-5">
          {item.description}
        </p>
      </div>
    </Reveal>
  );
}

export function DevotionsAbc() {
  return (
    <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
      <Reveal
        direction="up"
        className="mx-auto mb-5 md:mb-10 max-w-4xl space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[5px] text-primary">
            {abcOfMercyHeader.badge}
          </p>
          <span className="h-px w-10 bg-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold md:text-3xl lg:text-4xl">
          {abcOfMercyHeader.title}
        </h2>
      </Reveal>

      <div className="flex flex-col gap-10 md:gap-20">
        {/* Row 1: A and B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
          {abcOfMercy.slice(0, 2).map((item, i) => (
            <AbcItem key={item.letter} item={item} delay={i * 0.15} />
          ))}
        </div>

        {/* Row 2: C */}
        <div className="flex justify-center">
          {abcOfMercy.slice(2, 3).map((item) => (
            <div key={item.letter} className="w-full md:w-1/2">
              <AbcItem item={item} delay={0.3} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
