"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

// Reusable Style Component

function HighlightName({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-foreground">{children}</span>;
}

function DescriptionContent({
  description,
  name,
  nameSuffix,
}: {
  description?: ReactNode;
  name?: string;
  nameSuffix: string;
}) {
  if (description) return <>{description}</>;

  if (name) {
    return (
      <>
        <HighlightName>{name}</HighlightName> {nameSuffix}
      </>
    );
  }

  return <>Item {nameSuffix}</>;
}

export type DeleteConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  name?: string;
  nameSuffix?: string;
  confirmingText?: string;
};

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "Delete this item?",
  description,
  name,
  nameSuffix = "will be permanently removed. This action cannot be undone.",
  confirmingText = "Deleting...",
}: DeleteConfirmDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isDeleting) {
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>
            <DescriptionContent
              description={description}
              name={name}
              nameSuffix={nameSuffix}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>

          <Button onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <Loading size="sm" variant="white" text={confirmingText} />
            ) : (
              "Confirm"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
