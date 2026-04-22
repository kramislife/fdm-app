import Link from "next/link";
import { chaptersContent } from "@/config/about";
import { getPublicChapters } from "@/lib/data/chapters";
import { ChapterCard } from "@/components/chapters/chapter-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/animations/reveal";

export async function AboutChapters() {
  const chapters = await getPublicChapters();

  return (
    <section className="px-5 py-10 md:px-10 md:py-20 overflow-hidden">
      <Reveal className="mx-auto mb-10 max-w-4xl space-y-5 text-center">
        <p className="text-xs font-bold uppercase text-primary">
          {chaptersContent.eyebrow}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
          {chaptersContent.title}
        </h2>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          {chaptersContent.description}
        </p>
      </Reveal>

      {chapters.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">
          Chapters will be announced soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {chapters.map((chapter, i) => (
            <Reveal
              key={chapter.id}
              direction="up"
              delay={i * 0.1}
              className="flex-1"
            >
              <ChapterCard chapter={chapter} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal direction="up" className="mt-10 flex justify-center">
        <Link href="/chapters">
          <Button className="rounded-full h-auto px-7 py-5 md:px-10">
            View All Chapters
          </Button>
        </Link>
      </Reveal>
    </section>
  );
}
