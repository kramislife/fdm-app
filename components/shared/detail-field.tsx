import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { UserCell, DateCell } from "@/components/shared/cells";

// --------------------------------- Section ----------------------------------

interface DetailSectionProps {
  children: ReactNode;
  className?: string;
}

export function DetailSection({ children, className }: DetailSectionProps) {
  return (
    <div className={cn("flex flex-wrap gap-x-10 gap-y-8", className)}>
      {children}
    </div>
  );
}

// --------------------------------- Label and Text ------------------------------

interface DetailFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

export function DetailField({
  label,
  children,
  className,
  contentClassName,
  fullWidth = false,
}: DetailFieldProps) {
  return (
    <div
      className={cn("space-y-2", fullWidth ? "w-full" : "min-w-[150px]", className)}
    >
      <Label htmlFor={label} className="font-bold">{label}</Label>
      <div className={cn("text-sm", contentClassName)}>{children}</div>
    </div>
  );
}

// --------------------------------- Metadata ----------------------------------

interface DetailMetaProps {
  id: number;
  createdAt: string;
  updatedAt?: string | null;
  createdBy: { first_name: string; last_name: string } | null;
  updatedBy?: { first_name: string; last_name: string } | null;
}

export function DetailMeta({
  id,
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
}: DetailMetaProps) {
  return (
    <DetailSection className="pt-5 border-t gap-5">
      <div className="flex items-center gap-1 w-full">
        <p className="text-xs font-semibold uppercase">Record ID</p>
        <span className="font-mono text-primary bg-muted/50 p-1 rounded text-xs">
          #{id}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full">
        <DetailField
          label="Created At"
          contentClassName="text-xs text-muted-foreground"
        >
          <DateCell date={createdAt} />
        </DetailField>
        <DetailField
          label="Created By"
          contentClassName="text-xs text-muted-foreground"
        >
          <UserCell user={createdBy} />
        </DetailField>

        {updatedAt && (
          <DetailField
            label="Last Updated"
            contentClassName="text-xs text-muted-foreground"
          >
            <DateCell date={updatedAt} />
          </DetailField>
        )}
        {updatedBy && (
          <DetailField
            label="Updated By"
            contentClassName="text-xs text-muted-foreground"
          >
            <UserCell user={updatedBy} />
          </DetailField>
        )}
      </div>
    </DetailSection>
  );
}
