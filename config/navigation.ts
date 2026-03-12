export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Chapters", href: "/chapters" },
  { label: "Contact Us", href: "/contact-us" }
];
