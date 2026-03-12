import { useEffect } from "react";

// Closes a UI element (e.g., mobile menu or drawer) when the screen resizes beyond a specified breakpoint, usually when switching to desktop view.

export function useCloseOnResize(
  isOpen: boolean,
  setOpen: (open: boolean) => void,
  breakpoint: number = 768,
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= breakpoint) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, setOpen, breakpoint]);
}
