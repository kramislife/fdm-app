import Link from "next/link";
import { ctaContent } from "@/config/about";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/animations/reveal";
import { cn } from "@/lib/utils";

export function AboutCTA() {
  return (
    <section className="px-5 py-10 md:px-10 md:py-20 overflow-hidden text-left">
      <div className="flex flex-col lg:flex-row items-center gap-20">
        {/* Left: Content */}
        <Reveal direction="up" className="max-w-2xl space-y-5 flex-1">
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {ctaContent.eyebrow}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              {ctaContent.title}
            </h2>
            <div className="h-1 w-12 bg-primary" />
            <p className="pt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
              {ctaContent.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-5 pt-5">
            <Link href={ctaContent.primaryButton.href}>
              <Button className="rounded-full h-auto px-7 py-5 md:px-10">
                {ctaContent.primaryButton.label}
              </Button>
            </Link>
            <Link href={ctaContent.secondaryButton.href}>
              <Button
                variant="outline"
                className="rounded-full h-auto px-7 py-5 md:px-10"
              >
                {ctaContent.secondaryButton.label}
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Right: Bible Quotes */}
        <div className="flex-1 w-full relative">
          <div className="space-y-5">
            {ctaContent.bibleQuotes.map((quote, i) => (
              <Reveal
                key={i}
                direction="up"
                delay={i * 0.15}
                className={cn(
                  "relative rounded-3xl p-8 shadow-sm transition-transform hover:-translate-y-1 w-[85%]",
                  i === 0 && "z-10 bg-muted",
                  i === 1 && "z-30 ml-auto bg-primary text-white",
                  i === 2 && "z-20 bg-accent/50 text-primary",
                )}
              >
                <div className="space-y-3">
                  <p className="font-serif text-lg md:text-xl font-bold leading-tight italic">
                    {quote.text}
                  </p>
                  <p
                    className={cn(
                      "text-sm text-right font-bold uppercase tracking-widest",
                      i === 0
                        ? "text-muted-foreground"
                        : i === 1
                          ? "text-white"
                          : "text-primary",
                    )}
                  >
                    — {quote.reference}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
