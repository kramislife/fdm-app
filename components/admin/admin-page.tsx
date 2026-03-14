"use client";

import React, { useMemo, useState } from "react";
import { PageHeader } from "./page-header";
import { TableControls } from "./table-controls";
import { DataTable, type Column } from "./data-table";
import { AdminTableFooter } from "./table-footer";

interface AdminPageProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
}

export function AdminPage({
  title,
  description,
  action,
  columns,
  data,
  isLoading,
  searchPlaceholder,
}: AdminPageProps) {
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const filteredData = useMemo(() => {
    if (!searchValue) return data;
    const lower = searchValue.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        typeof val === "string" ? val.toLowerCase().includes(lower) : false
      )
    );
  }, [data, searchValue]);

  const effectivePerPage = perPage === 0 ? filteredData.length || 1 : perPage;
  const totalEntries = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / effectivePerPage));

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * effectivePerPage,
        currentPage * effectivePerPage
      ),
    [filteredData, currentPage, effectivePerPage]
  );

  function handlePerPageChange(value: number) {
    setPerPage(value);
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} action={action} />
      <TableControls
        perPage={perPage}
        onPerPageChange={handlePerPageChange}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
      />
      <AdminTableFooter
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={effectivePerPage}
        totalEntries={totalEntries}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
