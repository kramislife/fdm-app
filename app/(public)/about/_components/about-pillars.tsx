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
      <Reveal className="mb-10 space-y-5">
        <p className="text-xs font-bold uppercase text-primary">
          {pillarsContent.eyebrow}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
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
