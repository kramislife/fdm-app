export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About FDM", href: "/about" },
  { label: "Chapters", href: "/chapters" },
];
