import React from "react";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column = { key: string; label: string };

interface DataTableProps {
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  isLoading?: boolean;
}

export function DataTable({
  columns,
  data,
  isLoading = false,
}: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted hover:bg-muted/50">
          {columns.map((col) => (
            <TableHead key={col.key} className="text-center">
              {col.label}
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
            <TableRow key={rowIdx} className="hover:bg-muted/40 transition-colors">
              {columns.map((col) => (
                <TableCell key={col.key} className="text-center px-4 py-3">
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
