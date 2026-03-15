import Image from "next/image";
import Link from "next/link";

import { footerConfig } from "@/config/footer";

export function PublicFooter() {
  const { backgroundImage, navigation, quickLinks, chapters, brand } =
    footerConfig;

  return (
    <footer className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, #6B1014 0%, #8B1A1E 35%, #a92227 60%, #b82a2f 100%)",
        }}
      />

      {/* Divine Mercy background image */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-full w-full select-none"
      >
        <Image
          src={backgroundImage.src}
          alt={backgroundImage.alt}
          fill
          sizes="50vw"
          className="object-center md:object-contain md:object-bottom-left opacity-30"
          style={{ mixBlendMode: "luminosity" }}
          placeholder="blur"
        />
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 px-5 pt-10 pb-5 gap-x-5 gap-y-10">
        {/* Navigation Column */}
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-widest text-muted/50">
            {navigation.heading}
          </p>
          <nav className="flex flex-col gap-3">
            {navigation.links.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-sm text-white/80 transition-all hover:text-white hover:translate-x-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-widest text-muted/50">
            {quickLinks.heading}
          </p>
          <nav className="flex flex-col gap-3">
            {quickLinks.links.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-sm text-white/80 transition-all hover:text-white hover:translate-x-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Our Chapters Column */}
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-widest text-muted/50">
            {chapters.heading}
          </p>
          <ul className="flex flex-col gap-3">
            {chapters.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-white/80"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-muted/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* About FDM Column */}
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-widest text-muted/50">
            {brand.heading}
          </p>
          <div className="space-y-4">
            <p className="text-sm text-white/80 italic leading-relaxed">
              &ldquo;{brand.description}&rdquo;
            </p>
            <div className="flex flex-col items-end justify-end text-white/80">
              <p className="font-serif italic text-base md:text-lg tracking-wide">
                &ldquo;{brand.quote.text}&rdquo;
              </p>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase">
                &mdash; {brand.quote.attribution}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Socials */}
      <div className="relative z-10 flex justify-end gap-1 px-5 pb-5">
        {brand.socials.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
          >
            <item.Icon size={14} />
          </a>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-muted/10 p-5">
        <p className="text-sm text-muted/50 text-center">
          © {new Date().getFullYear()} Friends of the Divine Mercy. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
