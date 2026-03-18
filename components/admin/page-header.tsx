"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex gap-3 flex-row justify-between">
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          <Button onClick={action.onClick}>
            <Plus className="size-4" />
            <span className="hidden md:block">{action.label}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
