import Image from "next/image";
import { CalendarClock, ExternalLink } from "lucide-react";
import { FaMapLocationDot, FaLandmarkDome } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import { capitalizeWords, formatSchedule } from "@/lib/utils/format";
import webIcon from "@/app/assets/media/web-icon.png";

export type PublicChapter = {
  id: number;
  name: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  landmark: string | null;
  google_maps_url: string | null;
  image_url: string | null;
  fellowship_day: string | null;
  fellowship_time: string | null;
};

interface ChapterCardProps {
  chapter: PublicChapter;
  className?: string;
}

export function ChapterCard({ chapter, className }: ChapterCardProps) {
  const schedule = formatSchedule(
    chapter.fellowship_day,
    chapter.fellowship_time,
  );
  const fullLocality = [chapter.barangay, chapter.city]
    .filter(Boolean)
    .map((part) => capitalizeWords(part))
    .join(", ");

  return (
    <Card className="group relative overflow-hidden py-0 h-full gap-0">
      {chapter.google_maps_url && (
        <a
          href={chapter.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-30"
          aria-label={`Open ${chapter.name} location in Google Maps`}
        />
      )}
      {/* Image */}
      <div className="relative aspect-16/7 overflow-hidden">
        {chapter.image_url ? (
          <Image
            src={chapter.image_url}
            alt={chapter.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-all duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border-b">
            <Image
              src={webIcon}
              alt="icon"
              width={120}
              height={120}
              style={{ height: "auto" }}
              className="opacity-20 pointer-events-none"
              priority
            />
          </div>
        )}
      </div>

      {/* Body */}
      <CardContent className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight">
          {capitalizeWords(chapter.name)} Chapter
        </h3>
        <div className="h-0.5 w-10 rounded-full bg-border transition-all duration-300 group-hover:w-20 group-hover:bg-primary mb-5 mt-2" />

        <div className="flex flex-col gap-3">
          {/* Schedule */}
          {schedule && (
            <div className="flex items-start gap-2 text-sm">
              <CalendarClock className="h-4 w-4 shrink-0 text-primary mb-1" />
              <span className="font-semibold text-foreground/80 leading-snug">
                {schedule}
              </span>
            </div>
          )}

          {/* Landmark */}
          {chapter.landmark && (
            <div className="flex items-start gap-2 text-sm">
              <FaLandmarkDome className="h-4 w-4 shrink-0 text-primary mb-1" />
              <p className="text-muted-foreground leading-snug">
                {chapter.landmark}
              </p>
            </div>
          )}

          {/* Richer Location */}
          {fullLocality && (
            <div className="flex items-start gap-2 text-sm">
              <FaMapLocationDot className="h-4 w-4 shrink-0 text-primary mb-1" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {fullLocality}
                  {chapter.google_maps_url && (
                    <ExternalLink className="ml-1 inline h-3 w-3 opacity-70" />
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
