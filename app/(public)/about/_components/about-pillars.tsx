import { pillarsContent } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export function AboutPillars() {
  return (
    <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
      <Reveal
        direction="up"
        className="mx-auto mb-10 max-w-4xl space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[5px] text-primary">
            {pillarsContent.eyebrow}
          </p>
          <span className="h-px w-10 bg-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold md:text-3xl lg:text-4xl">
          {pillarsContent.title}
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {pillarsContent.items.map((pillar, i) => (
          <Reveal
            key={pillar.title}
            direction="up"
            delay={i * 0.15}
            className="h-full"
          >
            <Card className="border-t-2 border-t-primary h-full">
              <CardHeader className="space-y-3">
                <pillar.Icon className="h-8 w-8 text-primary" />
                <CardTitle className="font-serif text-2xl md:text-3xl font-extrabold">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  {pillar.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
