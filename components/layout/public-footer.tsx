import Link from "next/link";
import { navLinks } from "@/config/navigation";
import { Logo } from "@/components/ui/logo";

const chapters = ["Quezon City", "Bataan", "Cavite", "Pasay", "Pasig", "Tala"];

const contactLinks = [
  { label: "Contact Us", href: "/contact-us" },
  { label: "Find a Chapter", href: "/chapters" },
  { label: "Member Login", href: "/login" },
  { label: "Prayer Requests", href: "/contact-us" },
];

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-primary">
      {/* Layered bg depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(169,34,39,0.6) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(100,12,16,0.8) 0%, transparent 55%)",
        }}
      />

      {/* Rays SVG watermark */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 opacity-[0.05]"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          transform="translate(200,200)"
          stroke="white"
          strokeWidth="1"
          fill="none"
        >
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={Math.round(280 * Math.sin(rad))}
                y2={Math.round(-280 * Math.cos(rad))}
              />
            );
          })}
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1="0"
                y1="0"
                x2={Math.round(280 * Math.sin(rad))}
                y2={Math.round(-280 * Math.cos(rad))}
                strokeWidth="12"
                opacity="0.5"
              />
            );
          })}
        </g>
      </svg>

      {/* Main grid */}
      <div className="relative z-10 px-5 py-10 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-1">
            <p className="text-sm text-white max-w-md leading-relaxed">
              A community united in faith, service, and the mission of spreading
              God's mercy across Metro Manila and nearby provinces.
            </p>
         
            {/* Social */}
            <div className="flex gap-2 pt-1">
              {[
                { label: "f", title: "Facebook" },
                { label: "▶", title: "YouTube" },
                { label: "@", title: "Email" },
              ].map((s) => (
                <a
                  key={s.title}
                  href="#"
                  title={s.title}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-bold text-white/55 transition-all hover:border-white/40 hover:bg-white/15 hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              Navigation
            </p>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 transition-all hover:translate-x-1 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Chapters */}
          <div className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              Our Chapters
            </p>
            <ul className="flex flex-col gap-3">
              {chapters.map((chapter) => (
                <li
                  key={chapter}
                  className="flex items-center gap-2 text-sm text-white/55"
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/25" />
                  {chapter}
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              Get in Touch
            </p>
            <div className="flex flex-col gap-3">
              {contactLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-white/60 transition-all hover:translate-x-1 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                Community Hours
              </p>
              <p className="text-xs leading-[1.8] text-white/40">
                Gatherings vary per chapter.
                <br />
                Check your chapter schedule
                <br />
                for fellowship day and time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-5 md:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Friends of the Divine Mercy. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Use"].map((label, i, arr) => (
              <span key={label} className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-xs text-white/30 transition-colors hover:text-white/60"
                >
                  {label}
                </a>
                {i < arr.length - 1 && (
                  <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                )}
              </span>
            ))}
          </div>
          <p className="font-serif italic text-xs text-white/30">
            For Jesus, I Trust in You.
          </p>
        </div>
      </div>
    </footer>
  );
}
