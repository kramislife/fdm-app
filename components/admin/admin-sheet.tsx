"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export type AdminSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function AdminSheet({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isSubmitting,
  submitLabel = "Save",
}: AdminSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:sm:max-w-lg gap-0"
      >
        {/* Form Title */}
        <SheetHeader className="border-b">
          <SheetTitle className="font-extrabold text-lg">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {/* Form Content Fields */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">{children}</div>

        {/* Form Footer */}
        <SheetFooter className="flex-row gap-2 pt-5 border-t">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary cursor-pointer"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loading size="sm" variant="white" text="Saving..." />
            ) : (
              submitLabel
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
