import { LayoutGrid, ClipboardCopy, Send } from "lucide-react";
import { stepsContent } from "@/config/donations";
import { Reveal } from "@/components/shared/animations/reveal";
import { Card, CardContent } from "@/components/ui/card";

const stepIcons = [LayoutGrid, ClipboardCopy, Send];

export function DonationsSteps() {
  return (
    <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
      {/* Section header */}
      <Reveal
        direction="up"
        className="mx-auto mb-10 max-w-4xl space-y-5 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[5px] text-primary">
            How to Donate
          </p>
          <span className="h-px w-10 bg-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold md:text-3xl lg:text-4xl">
          Simple Steps to Give
        </h2>
      </Reveal>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stepsContent.map((step, i) => {
          const Icon = stepIcons[i];
          return (
            <Reveal key={step.number} direction="up" delay={i * 0.1}>
              <Card className="overflow-hidden py-0">
                {/* Colored header */}
                <div
                  className="flex items-center gap-3 p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, #7A1818 0%, #B83232 100%)",
                  }}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <Icon className="size-4 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[3px] text-white/80">
                    Step {step.number}
                  </span>
                </div>

                {/* Content */}
                <CardContent className="space-y-3 p-5">
                  <h3 className="text-base md:text-lg font-bold">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
