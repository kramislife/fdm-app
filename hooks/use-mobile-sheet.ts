"use client";

import { useState } from "react";
import { useCloseOnResize } from "@/hooks/use-close-on-resize";

export function useMobileSheet() {
  const [open, setOpen] = useState(false);
  useCloseOnResize(open, setOpen);
  return { open, setOpen };
}
