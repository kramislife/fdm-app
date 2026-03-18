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
      <div className="shrink-0">
        <Select
          value={String(perPage)}
          onValueChange={(v) => onPerPageChange(Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 items</SelectItem>
            <SelectItem value="20">20 items</SelectItem>
            <SelectItem value="30">30 items</SelectItem>
            <SelectItem value="50">50 items</SelectItem>
            <SelectItem value="100">100 items</SelectItem>
          </SelectContent>
        </Select>
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
