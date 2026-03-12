"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  heroContent,
  pillarsContent,
  communityGallery,
  ctaContent,
  chaptersContent,
  missionContent,
  communityStats,
  story,
} from "@/config/about";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function AboutPage() {
  const {
    fadeIn,
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    staggerContainer,
    getAnimationProps,
  } = useScrollAnimation();

  return (
    <main className="overflow-x-hidden">
      {/* ---------------------------- Hero Section ----------------------------- */}
      <section className="relative overflow-hidden px-5 py-10 md:px-10 md:py-20">
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          {/* Left Content */}
          <motion.div
            className="flex flex-1 flex-col items-start gap-5 text-left"
            {...getAnimationProps(fadeInLeft)}
            animate="whileInView" // Trigger immediately on load for Hero
          >
            <Badge
              variant="outline"
              className="gap-2 py-3 uppercase tracking-widest text-primary"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              {heroContent.badge}
            </Badge>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1]">
              {heroContent.title}
            </h1>

            <p className="max-w-3xl text-sm md:text-base leading-relaxed text-muted-foreground">
              {heroContent.description}
            </p>
          </motion.div>

          {/* Right Image with Stylized Shape */}
          <motion.div
            className="relative hidden w-full flex-1 lg:block"
            {...getAnimationProps(fadeInRight)}
            animate="whileInView" // Trigger immediately on load for Hero
          >
            <div className="relative aspect-video overflow-hidden rounded-bl-[50px] rounded-br-[100px] rounded-tl-[200px] rounded-tr-3xl shadow-2xl transition-transform duration-500 hover:scale-105">
              <Image
                src={heroContent.image.src}
                alt={heroContent.image.alt}
                className="object-cover"
                priority
              />
              {/* Subtle inner glow/overlay */}
              <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------- Mission Section ---------------------------- */}
      <motion.section
        className="bg-muted/50 px-5 py-10 md:px-10 md:py-20"
        {...getAnimationProps(fadeInUp)}
      >
        <div className="mx-auto max-w-5xl space-y-5 text-center">
          <p className="text-xs font-bold uppercase text-primary">
            {missionContent.eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {missionContent.title}
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            {missionContent.description}
          </p>
        </div>

        {/* Mission Image Carousel */}
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
                      loading="lazy"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </motion.section>

      {/* ---------------------------- Pillars Section ---------------------------- */}
      <section className="px-5 py-10 md:px-10 md:py-20">
        <motion.div
          className="mb-10 space-y-5"
          {...getAnimationProps(fadeInUp)}
        >
          <p className="text-xs font-bold uppercase text-primary">
            {pillarsContent.eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {pillarsContent.title}
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          {...getAnimationProps(staggerContainer)}
        >
          {pillarsContent.items.map((pillar) => (
            <motion.div key={pillar.title} variants={fadeInUp}>
              <Card className="border-t-2 border-t-primary h-full">
                <CardHeader className="space-y-3">
                  <pillar.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="font-serif text-2xl md:text-3xl font-extrabold">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm md:text-base leading-relaxed">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------------------- Chapters Section ---------------------------- */}
      <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
        <motion.div
          className="mx-auto mb-10 max-w-4xl space-y-5 text-center"
          {...getAnimationProps(fadeInUp)}
        >
          <p className="text-xs font-bold uppercase text-primary">
            {chaptersContent.eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {chaptersContent.title}
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            {chaptersContent.description}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {chaptersContent.items.map((chapter) => (
            <motion.div key={chapter.id} variants={fadeInUp}>
              <Card className="group overflow-hidden pt-0 cursor-pointer h-full">
                {/* Chapter image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={chapter.image.src}
                    alt={chapter.image.alt}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Card body */}
                <CardHeader className="space-y-2">
                  <div className="h-1 w-9 rounded-full bg-border transition-colors group-hover:bg-primary" />
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground transition-colors group-hover:text-primary">
                      {chapter.day}
                    </p>
                    <CardTitle className="font-serif text-2xl font-bold transition-colors group-hover:text-primary">
                      {chapter.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {chapter.location}
                    </p>
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
          ))}
        </motion.div>
      </section>

      {/*  ---------------------- Our Community Section --------------------- */}
      <motion.section
        className="relative overflow-hidden aspect-4/5 md:aspect-16/7"
        {...getAnimationProps(fadeIn)}
      >
        {/* Full-bleed background image */}
        <Image
          src={communityGallery.image.src}
          alt={communityGallery.image.alt}
          className="object-cover"
        />
        {/* Dark gradient overlay for bottom-left text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end px-5 py-10 md:px-10 md:pb-20">
          <motion.div
            className="max-w-xl space-y-5"
            {...getAnimationProps(fadeInUp)}
          >
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
          </motion.div>
        </div>
      </motion.section>

      {/*  ---------------------- Stats Strip --------------------- */}
      <section className="bg-sidebar px-5 py-10 md:px-10 md:py-20">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          {...getAnimationProps(staggerContainer)}
        >
          {communityStats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center"
              variants={fadeInUp}
            >
              <span className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                {stat.value}
              </span>
              <span className="text-sm md:text-base text-white">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/*  ---------------------- Our Story --------------------- */}
      <section
        id="our-story"
        className="relative overflow-hidden aspect-4/5 md:aspect-16/7"
      >
        {/* Full-bleed background image */}
        <Image
          src={story.image.src}
          alt={story.image.alt}
          className="object-cover"
        />

        {/* Gradient overlay — opaque left, fades right */}
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 to-black/30 lg:to-black/10" />

        {/* Bottom vignette for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center px-5 py-10 md:px-10 md:py-20">
          <motion.div
            className="max-w-xl space-y-5"
            {...getAnimationProps(fadeInLeft)}
          >
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
                className="text-sm md:text-base leading-relaxed text-white/75"
              >
                {p}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/*  ---------------------- CTA --------------------- */}
      <section className="px-5 py-10 md:px-10 md:py-20 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left: Content */}
          <motion.div
            className="max-w-2xl space-y-5 flex-1 text-left"
            {...getAnimationProps(fadeInUp)}
          >
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {ctaContent.eyebrow}
              </p>
              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                {ctaContent.title}
              </h2>
              <div className="h-1 w-12 bg-primary" />
              <p className="pt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                {ctaContent.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-5">
              <Link href={ctaContent.primaryButton.href}>
                <Button className="rounded-full h-auto px-10 py-5 cursor-pointer">
                  {ctaContent.primaryButton.label}
                </Button>
              </Link>
              <Link href={ctaContent.secondaryButton.href}>
                <Button
                  variant="outline"
                  className="rounded-full h-auto px-10 py-5 cursor-pointer"
                >
                  {ctaContent.secondaryButton.label}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Refined Staggered Cards */}
          <motion.div
            className="flex-1 w-full relative"
            {...getAnimationProps(staggerContainer)}
          >
            <div className="space-y-5">
              {/* Card 1 */}
              <motion.div
                className="relative z-10 w-[85%] rounded-3xl bg-muted p-8 shadow-sm transition-transform hover:-translate-y-1"
                variants={fadeInUp}
              >
                <div className="space-y-3">
                  <p className="font-serif text-lg md:text-xl font-bold leading-tight italic">
                    {ctaContent.bibleQuotes[0].text}
                  </p>
                  <p className="text-sm text-right font-bold uppercase tracking-widest text-muted-foreground">
                    - {ctaContent.bibleQuotes[0].reference}
                  </p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="relative z-30 w-[85%] ml-auto rounded-3xl bg-primary p-8 shadow-sm transition-transform hover:-translate-y-1"
                variants={fadeInUp}
              >
                <div className="space-y-3">
                  <p className="font-serif text-lg md:text-xl font-bold leading-tight text-white italic">
                    {ctaContent.bibleQuotes[1].text}
                  </p>
                  <p className="text-sm text-right font-bold uppercase tracking-widest text-white">
                    - {ctaContent.bibleQuotes[1].reference}
                  </p>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                className="relative z-20 w-[85%] rounded-3xl bg-accent/50 p-8 shadow-sm transition-transform hover:-translate-y-1"
                variants={fadeInUp}
              >
                <div className="space-y-3">
                  <p className="font-serif text-lg md:text-xl font-bold leading-tight text-primary italic">
                    {ctaContent.bibleQuotes[2].text}
                  </p>
                  <p className="text-sm text-right font-bold uppercase tracking-widest text-primary">
                    - {ctaContent.bibleQuotes[2].reference}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
