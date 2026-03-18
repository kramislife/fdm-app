"use client";

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

export type RowActionMenuProps = {
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  viewDetailsLabel?: string;
  disabled?: boolean;
};

export function RowActionMenu({
  onEdit,
  onDelete,
  onViewDetails,
  editLabel = "Edit",
  deleteLabel = "Delete",
  viewDetailsLabel = "View",
  disabled,
}: RowActionMenuProps) {
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
      <DropdownMenuContent align="end">
        {onViewDetails && (
          <>
            <DropdownMenuItem
              onClick={onViewDetails}
              className="cursor-pointer text-sm"
            >
              <FaEye className="size-4 mb-0.5" />
              {viewDetailsLabel}
            </DropdownMenuItem>
          </>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-sm">
            <RiFileEditFill className="size-4 mb-0.5" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            {onEdit && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <RiDeleteBin2Fill className="size-4 mb-0.5" />
              {deleteLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
