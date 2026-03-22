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

export type ConfirmActionDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  name?: string;
  nameSuffix?: string;
  confirmingText?: string;
};

export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  isPending = false,
  title = "Confirm this action?",
  description,
  name,
  nameSuffix = "will be processed. This action cannot be undone.",
  confirmingText = "Confirming...",
}: ConfirmActionDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
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
          <AlertDialogCancel onClick={onClose} disabled={isPending}>
            Cancel
          </AlertDialogCancel>

          <Button 
             variant="default"
             onClick={onConfirm} 
             disabled={isPending}
          >
            {isPending ? (
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

// Keep an alias for backwards compatibility if needed, but let's encourage the new name.
export { ConfirmActionDialog as ConfirmDialog };
