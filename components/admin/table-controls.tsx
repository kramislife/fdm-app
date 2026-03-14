"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableControlsProps {
  perPage: number;
  searchInput: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
}

export function TableControls({
  perPage,
  searchInput,
  searchPlaceholder = "Search...",
  onSearchChange,
  onPerPageChange,
}: TableControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <span>Show</span>
        <Select
          value={String(perPage)}
          onValueChange={(v) => onPerPageChange(Number(v))}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>entries</span>
      </div>
      <div className="relative w-full max-w-64">
        <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={searchPlaceholder}
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
