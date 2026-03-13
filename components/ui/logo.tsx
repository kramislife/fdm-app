"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoImage from "@/app/assets/media/logo.png";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  src?: StaticImageData;
  text?: string;
  title?: string;
  size?: string;
}

export function Logo({
  className,
  imageClassName,
  src = logoImage,
  text = "FDM",
  title = "Navigate to Home",
  size = "w-10",
}: LogoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Link href="/" className={cn("inline-flex", className)} title={title}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          size,
        )}
      >
        {!hasError ? (
          <Image
            src={src}
            alt={`${text} Logo`}
            className={cn("h-auto w-full object-contain", imageClassName)}
            onError={() => setHasError(true)}
            priority
            placeholder="blur"
          />
        ) : (
          <h1 className="font-serif text-xl font-bold tracking-tight text-primary md:text-2xl">
            {text}
          </h1>
        )}
      </div>
    </Link>
  );
}
