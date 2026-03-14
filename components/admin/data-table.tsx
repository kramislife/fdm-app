"use client";

import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  return (
    <span className="inline-flex flex-col ml-1 align-middle">
      <ChevronUp
        className={cn(
          "size-3 -mb-1",
          active && order === "asc"
            ? "text-primary"
            : "text-muted-foreground/40",
        )}
      />
      <ChevronDown
        className={cn(
          "size-3",
          active && order === "desc"
            ? "text-primary"
            : "text-muted-foreground/40",
        )}
      />
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
                "text-left px-4 py-3",
                col.sortable &&
                  "cursor-pointer select-none hover:text-foreground",
              )}
              onClick={col.sortable ? () => onSort?.(col.key) : undefined}
            >
              {col.label}
              {col.sortable && (
                <SortIcon active={sort === col.key} order={order} />
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-32">
              <div className="flex justify-center items-center">
                <Loading size="md" variant="primary" />
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
                    className="text-left px-4 py-3"
                    style={col.maxWidth ? { maxWidth: col.maxWidth } : undefined}
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
