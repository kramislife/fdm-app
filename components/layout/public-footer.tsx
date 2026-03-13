import Image from "next/image";
import Link from "next/link";

import divineMercy from "@/app/assets/media/divine-mercy-footer.png";

import {
  navLinks,
  footerChapters,
  quickLinks,
  footerBrand,
  type QuickLink,
} from "@/config/footer";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm font-bold uppercase tracking-widest text-muted/50">
        {heading}
      </p>
      {children}
    </div>
  );
}

function FooterNavList({ items }: { items: QuickLink[] }) {
  return (
    <nav className="flex flex-col gap-3">
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className="text-sm text-white/80 transition-all hover:text-white hover:translate-x-1"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function FooterBulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-2 text-sm text-white/80"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-muted/50" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

export function PublicFooter() {
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
          src={divineMercy}
          alt="Divine Mercy Image"
          fill
          sizes="38vw"
          className="object-contain object-bottom-left opacity-30"
          style={{ mixBlendMode: "luminosity" }}
          placeholder="blur"
        />
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 px-5 py-10 gap-10">
        <FooterColumn heading="Navigation">
          <FooterNavList items={navLinks} />
        </FooterColumn>

        <FooterColumn heading="Our Chapters">
          <FooterBulletList items={footerChapters} />
        </FooterColumn>

        <FooterColumn heading="Quick Links">
          <FooterNavList items={quickLinks} />
        </FooterColumn>

        <FooterColumn heading="About FDM">
          <h3 className="font-serif text-xl md:text-2xl font-bold text-white/80">
            {footerBrand.heading}
          </h3>
          <p className="text-sm text-white/80 italic leading-relaxed">
            &ldquo;{footerBrand.description}&rdquo;
          </p>
          <div className="text-right text-white/80">
            <p className="font-serif italic text-base tracking-wide">
              &ldquo;{footerBrand.quote.text}&rdquo;
            </p>
            <p className="mt-1 text-xs font-bold uppercase">
              &mdash; {footerBrand.quote.attribution}
            </p>
          </div>
        </FooterColumn>
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
