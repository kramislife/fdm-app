"use client";

import Image from "next/image";
import { missionContent } from "@/config/about";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function MissionCarousel() {
  return (
    <div className="mt-10">
      <Carousel
        opts={{ loop: true, align: "start" }}
        plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
        className="w-full"
      >
        <CarouselContent>
          {missionContent.items.map((img, i) => (
            <CarouselItem
              key={i}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="relative aspect-video overflow-hidden rounded-md">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  placeholder="blur"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
}
