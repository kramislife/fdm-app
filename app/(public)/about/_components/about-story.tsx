import Image from "next/image";
import { story } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";

export function AboutStory() {
  return (
    <section
      id="our-story"
      className="relative overflow-hidden aspect-4/5 md:aspect-16/7"
    >
      <Image
        src={story.image.src}
        alt={story.image.alt}
        fill
        sizes="100vw"
        className="object-cover"
        placeholder="blur"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 to-black/30 lg:to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      <div className="absolute inset-0 flex items-center px-5 py-10 md:px-10 md:py-20">
        <Reveal direction="left" className="max-w-xl space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {story.eyebrow}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            {story.title}
          </h2>
          <div className="h-1 w-12 bg-primary" />
          {story.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-xs md:text-sm lg:text-base leading-relaxed text-white/75"
            >
              {p}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
