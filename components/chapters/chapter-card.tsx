import Image from "next/image";
import { motion, type Variants } from "framer-motion";

import type { Chapter } from "@/config/about";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChapterCardProps {
  chapter: Chapter;
  variants?: Variants;
}

export function ChapterCard({ chapter, variants }: ChapterCardProps) {
  return (
    <motion.div variants={variants}>
      <Card className="group overflow-hidden pt-0 cursor-pointer h-full gap-3">
        {/* Chapter image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={chapter.image.src}
            alt={chapter.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
          />
        </div>

        {/* Card body */}
        <CardHeader className="space-y-2">
          <div className="space-y-2 mt-2">
            <p className="text-xs font-bold uppercase text-muted-foreground transition-colors group-hover:text-primary">
              {chapter.day}
            </p>
            <div className="h-1 w-4 rounded-full bg-border transition-all duration-300 group-hover:w-20 group-hover:bg-primary" />
            <CardTitle className="font-serif text-2xl font-bold transition-colors group-hover:text-primary">
              {chapter.name}
              <p className="mt-1 text-sm font-semibold">{chapter.location}</p>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <hr className="mb-4 border-border" />
          <CardDescription className="text-sm leading-relaxed">
            {chapter.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
