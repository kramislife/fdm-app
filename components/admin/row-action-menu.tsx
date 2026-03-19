"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiDeleteBin2Fill, RiFileEditFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { TfiMoreAlt } from "react-icons/tfi";

export type ExtraAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
};

export type RowActionMenuProps = {
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  viewDetailsLabel?: string;
  disabled?: boolean;
  extraItems?: ExtraAction[];
};

export function RowActionMenu({
  onEdit,
  onDelete,
  onViewDetails,
  editLabel = "Edit",
  deleteLabel = "Delete",
  viewDetailsLabel = "View",
  disabled,
  extraItems,
}: RowActionMenuProps) {
  const hasExtra = extraItems && extraItems.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="size-8"
        >
          <TfiMoreAlt className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 space-y-1">
        {onViewDetails && (
          <DropdownMenuItem onClick={onViewDetails}>
            <FaEye className="mb-0.5" />
            {viewDetailsLabel}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <RiFileEditFill className="mb-0.5" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {hasExtra &&
          extraItems.map((item) => (
            <DropdownMenuItem key={item.label} onClick={item.onClick}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <RiDeleteBin2Fill className="mb-0.5" />
              {deleteLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
