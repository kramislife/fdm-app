"use client";

import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/loading";

const CarouselComponent = dynamic(() => import("./mission-carousel"), {
  ssr: false,
  loading: () => (
    <div className="h-60 w-full animate-pulse flex items-center justify-center bg-muted/20 rounded-lg">
      <Loading size="lg" variant="primary" text="Loading highlights..." />
    </div>
  ),
});

export function MissionCarouselWrapper() {
  return <CarouselComponent />;
}
