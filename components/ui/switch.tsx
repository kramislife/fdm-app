"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30",
        "data-[size=default]:h-5 data-[size=default]:w-9",
        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
          "group-data-[size=default]/switch:size-4 group-data-[size=default]/switch:data-[state=checked]:translate-x-4 group-data-[size=default]/switch:data-[state=unchecked]:translate-x-0",
          "group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:data-[state=checked]:translate-x-2 group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-0 group-data-[size=default]/switch:translate-y-[0.2px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
