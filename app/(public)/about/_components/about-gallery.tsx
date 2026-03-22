import Image from "next/image";
import { communityGallery } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";

export function AboutGallery() {
  return (
    <section className="relative overflow-hidden aspect-4/5 md:aspect-16/5 mb-2">
      <Image
        src={communityGallery.image.src}
        alt={communityGallery.image.alt}
        fill
        sizes="100vw"
        className="object-cover"
        placeholder="blur"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-end px-5 py-10 md:px-10">
        <Reveal direction="up" className="max-w-xl space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-white">
            {communityGallery.eyebrow}
          </p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white">
            {communityGallery.title}
          </h2>
          <div className="h-1 w-12 bg-primary" />
          <p className="text-sm md:text-base leading-relaxed text-white/75">
            {communityGallery.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
