"use client";

import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loading } from "@/components/ui/loading";

export type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  maxWidth?: string;
  align?: "left" | "center" | "right";
};

interface DataTableProps {
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  isLoading?: boolean;
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (key: string) => void;
  getCellTitle?: (value: React.ReactNode) => string | undefined;
}

function SortIcon({
  active,
  order,
}: {
  active: boolean;
  order?: "asc" | "desc";
}) {
  if (active && order === "asc")
    return <ChevronUp className="size-3 text-primary shrink-0" />;
  if (active && order === "desc")
    return <ChevronDown className="size-3 text-primary shrink-0" />;
  return (
    <span className="inline-flex flex-col shrink-0">
      <ChevronUp className="size-3 -mb-1 text-muted-foreground/40" />
      <ChevronDown className="size-3 text-muted-foreground/40" />
    </span>
  );
}

export function DataTable({
  columns,
  data,
  isLoading = false,
  sort,
  order,
  onSort,
  getCellTitle,
}: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted hover:bg-muted/50">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              style={col.maxWidth ? { maxWidth: col.maxWidth } : undefined}
              className={cn(
                col.sortable &&
                  "cursor-pointer select-none hover:text-foreground",
                col.align === "center" && "text-center",
                col.align === "right" && "text-right",
              )}
              onClick={() => col.sortable && onSort?.(col.key)}
            >
              <div
                className={cn(
                  "relative flex items-center w-full",
                  col.align === "center" ? "justify-center" : "justify-between",
                  col.align === "right" && "justify-end",
                )}
              >
                <span
                  className={cn(
                    col.align === "center" && "text-center w-full",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.label}
                </span>
                {col.sortable && (
                  <div
                    className={cn(
                      "flex items-center",
                      col.align === "center" && "absolute right-0",
                    )}
                  >
                    <SortIcon active={sort === col.key} order={order} />
                  </div>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24">
              <div className="flex justify-center items-center">
                <Loading size="md" text="Syncing Data..." />
              </div>
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-32 text-center text-sm text-muted-foreground"
            >
              No data found.
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              className="hover:bg-muted/40 transition-colors"
            >
              {columns.map((col) => {
                const value = row[col.key];
                const titleText = getCellTitle?.(value);
                return (
                  <TableCell
                    key={col.key}
                    style={
                      col.maxWidth ? { maxWidth: col.maxWidth } : undefined
                    }
                    className={cn(
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                    )}
                  >
                    <div
                      className={cn(col.maxWidth && "truncate")}
                      title={titleText}
                    >
                      {value}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
