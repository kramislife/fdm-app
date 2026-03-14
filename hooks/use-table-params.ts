"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { VALID_PER_PAGE } from "@/lib/table";

export interface TableParamHandlers {
  search: string;
  searchInput: string;
  perPage: number;
  page: number;
  sort: string;
  order: "asc" | "desc";
  isPending: boolean;
  handleSearch: (value: string) => void;
  handlePerPage: (value: number) => void;
  handlePage: (page: number) => void;
  handleSort: (key: string) => void;
  getRange: (totalEntries: number) => { from: number; to: number };
}

export function useTableParams(defaultSort = "name"): TableParamHandlers {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Derive current state from URL
  const urlSearch = searchParams.get("search") ?? "";
  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const urlPerPageRaw = Number(searchParams.get("perPage"));
  const urlPerPage = (VALID_PER_PAGE as readonly number[]).includes(
    urlPerPageRaw,
  )
    ? urlPerPageRaw
    : 10;
  const urlSortRaw = searchParams.get("sort");
  const urlSort = urlSortRaw ?? defaultSort;
  const urlOrder: "asc" | "desc" =
    searchParams.get("order") === "asc" ? "asc" : "desc";

  // Local state for the input so it updates on every keystroke
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Sync input when URL search changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  function buildParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    return params;
  }

  function navigate(params: URLSearchParams) {
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearch(value: string) {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = buildParams({ search: value || null, page: "1" });
      navigate(params);
    }, 300);
  }

  function handlePerPage(value: number) {
    navigate(buildParams({ perPage: String(value), page: "1" }));
  }

  function handlePage(page: number) {
    navigate(buildParams({ page: String(page) }));
  }

  function handleSort(key: string) {
    const nextOrder = urlSort === key && urlOrder === "desc" ? "asc" : "desc";
    navigate(buildParams({ sort: key, order: nextOrder, page: "1" }));
  }

  function getRange(totalEntries: number) {
    const from = totalEntries === 0 ? 0 : (urlPage - 1) * urlPerPage + 1;
    const to = Math.min(urlPage * urlPerPage, totalEntries);
    return { from, to };
  }

  return {
    search: urlSearch,
    searchInput,
    perPage: urlPerPage,
    page: urlPage,
    sort: urlSort,
    order: urlOrder,
    isPending,
    handleSearch,
    handlePerPage,
    handlePage,
    handleSort,
    getRange,
  };
}
