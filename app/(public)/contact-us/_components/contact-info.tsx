import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { contactSection } from "@/config/contact";
import { Reveal } from "@/components/shared/animations/reveal";

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-5">
      {/* Church Image */}
      <Reveal
        direction="left"
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
            <MapPin className="mb-1" />
            {contactSection.image.badge}
          </Badge>
        </div>
      </Reveal>

      {/* Contact Info Details */}
      <div className="flex flex-col gap-5">
        <Reveal direction="up" className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-primary" />
          <h2 className="font-serif text-xl font-bold md:text-2xl lg:text-3xl">
            {contactSection.title}
          </h2>
        </Reveal>

        {contactSection.items.map(({ Icon, label, value, href }, i) => (
          <Reveal
            key={label}
            direction="up"
            delay={i * 0.1}
            className="flex items-start gap-2 text-left"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Icon className="h-4 w-4 text-primary mb-1" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-extrabold text-primary">{label}</h3>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-info leading-relaxed underline underline-offset-4 break-all"
                >
                  {value}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
