"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  useScrollAnimation,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
} from "@/hooks/use-scroll-animation";

import {
  heroContent,
  contactSection,
  inquiryTypes,
  socialLinks,
  mapContent,
  formContent,
} from "@/config/contact";

export default function ContactPage() {
  const { getAnimationProps } = useScrollAnimation();

  return (
    <main>
      {/* -------------------------- Hero --------------------------- */}
      <section className="bg-muted/50 px-5 py-10 md:px-10 md:py-20">
        <motion.div
          className="space-y-5 text-center"
          {...getAnimationProps(fadeInUp)}
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
            {heroContent.title}
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            {heroContent.description}
          </p>
        </motion.div>
      </section>

      {/* -------------------- Contact Info + Form --------------------- */}
      <section className="px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-start">
          <motion.div
            className="flex flex-col gap-5"
            {...getAnimationProps(staggerContainer)}
          >
            {/* Church Image */}
            <motion.div
              variants={fadeInLeft}
              className="relative hidden aspect-video w-full overflow-hidden rounded-md shadow-md md:flex"
            >
              <Image
                src={contactSection.image.src}
                alt={contactSection.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                placeholder="blur"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 right-4">
                <Badge className="items-center gap-2 px-3 py-5 text-sm font-bold uppercase tracking-widest rounded-none [&>svg]:size-5!">
                  <MapPin />
                  {contactSection.image.badge}
                </Badge>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="flex flex-col gap-5"
              {...getAnimationProps(staggerContainer)}
            >
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-3"
              >
                <div className="h-7 w-1 rounded-full bg-primary" />
                <h2 className="font-serif text-xl font-bold md:text-2xl lg:text-3xl">
                  {contactSection.title}
                </h2>
              </motion.div>

              {contactSection.items.map(({ Icon, label, value }) => (
                <motion.div
                  key={label}
                  variants={fadeInUp}
                  className="flex items-start gap-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-extrabold text-primary">
                      {label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/*------------------------ Right: Contact Form -------------------------*/}
          <motion.div
            {...getAnimationProps(fadeInRight)}
            className="lg:sticky lg:top-20"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl font-bold md:text-3xl">
                  {formContent.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {formContent.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3">
                <form className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-2">
                    {/* Full Name */}
                    <div className="flex flex-col md:col-span-2 gap-2">
                      <Label
                        htmlFor="full-name"
                        className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="full-name"
                        name="full-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your full name"
                        className="h-12"
                      />
                    </div>

                    {/* Inquiry Type */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="inquiry-type"
                        className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
                      >
                        Inquiry Type
                      </Label>
                      <Select name="inquiry-type">
                        <SelectTrigger id="inquiry-type" className="w-full h-12">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {inquiryTypes.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@gmail.com"
                      className="h-12"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="message"
                      className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Write your message here..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="h-12 cursor-pointer">
                    {formContent.submitLabel}
                  </Button>
                </form>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-5 mt-5">
                  {socialLinks.map(({ Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="text-primary transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------- Our Location ------------------------------------- */}
      <section className="bg-muted/50 px-5 py-10">
        <motion.div
          className="flex flex-col gap-5"
          {...getAnimationProps(staggerContainer)}
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-primary" />
            <h2 className="font-serif text-xl font-bold md:text-2xl lg:text-3xl">
              {mapContent.title}
            </h2>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="overflow-hidden rounded-md shadow-md"
          >
            <iframe
              title="Home of Mercy - Pasay"
              src={mapContent.src}
              width="100%"
              height="500"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
