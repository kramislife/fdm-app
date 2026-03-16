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

export type DetailSheetProps = {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function DetailSheet({
  open,
  onClose,
  onEdit,
  title,
  description,
  children,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:w-5/6 data-[side=right]:md:max-w-xl gap-0"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b">
            <SheetTitle className="font-extrabold text-lg">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">{children}</div>

          <SheetFooter className="flex-row gap-2 pt-5 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onClose}
            >
              Close
            </Button>
            {onEdit && (
              <Button
                type="button"
                className="flex-1 cursor-pointer"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
