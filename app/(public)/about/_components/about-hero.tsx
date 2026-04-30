import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { heroContent } from "@/config/about";
import { Reveal } from "@/components/shared/animations/reveal";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden px-5 py-10 md:px-10 md:py-20">
      <div className="flex flex-col items-center gap-10 lg:flex-row text-left">
        {/* Left Content */}
        <div className="flex flex-1 flex-col items-start gap-5">
          <Reveal direction="left" delay={0.1} immediate duration={800}>
            <Badge
              variant="outline"
              className="gap-2 py-3 uppercase tracking-widest text-primary"
            >
              <span className="h-2 w-2 rounded-full bg-primary mb-0.5" />
              {heroContent.badge}
            </Badge>
          </Reveal>

          <Reveal direction="left" delay={0.25} immediate duration={1000}>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extrabold">
              {heroContent.title}
            </h1>
          </Reveal>

          <Reveal direction="left" delay={0.4} immediate duration={1000}>
            <p className="max-w-3xl text-sm md:text-base leading-relaxed text-muted-foreground">
              {heroContent.description}
            </p>
          </Reveal>
        </div>

        {/* Right Image */}
        <Reveal 
          direction="up" 
          delay={0.6} 
          immediate 
          duration={1200}
          className="relative hidden w-full flex-1 lg:block"
        >
          <div className="relative aspect-video overflow-hidden rounded-bl-[50px] rounded-br-[100px] rounded-tl-[200px] rounded-tr-3xl shadow-2xl transition-transform duration-700 hover:scale-105">
            <Image
              src={heroContent.image.src}
              alt={heroContent.image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
