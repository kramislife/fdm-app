import { mapContent } from "@/config/contact";
import { Reveal } from "@/components/shared/animations/reveal";

export function ContactMap() {
  return (
    <section className="bg-muted/50 px-5 py-10">
      <div className="flex flex-col gap-5">
        <Reveal direction="up" className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-primary" />
          <h2 className="font-serif text-xl font-bold md:text-2xl lg:text-3xl text-left">
            {mapContent.title}
          </h2>
        </Reveal>

        <Reveal
          direction="up"
          delay={0.2}
          className="overflow-hidden rounded-md shadow-md"
        >
          <iframe
            title="Home of Mercy - Pasay"
            src={mapContent.src}
            width="100%"
            height="500"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}
