"use client";

import React from "react";

import { PageHeader } from "./page-header";
import { TableControls } from "./table-controls";
import { DataTable, type Column } from "./data-table";
import { AdminTableFooter } from "./table-footer";

import { useTableParams } from "@/hooks/use-table-params";

interface Pagination {
  page: number;
  perPage: number;
  totalPages: number;
  totalEntries: number;
}

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
  pagination: Pagination;
}

export function AdminPage({
  title,
  description,
  action,
  columns,
  data,
  isLoading,
  searchPlaceholder,
  pagination,
}: AdminPageProps) {
  const table = useTableParams();

  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} action={action} />
      <TableControls
        perPage={table.perPage}
        searchInput={table.searchInput}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={table.handleSearch}
        onPerPageChange={table.handlePerPage}
      />
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading || table.isPending}
        sort={table.sort}
        order={table.order}
        onSort={table.handleSort}
        getCellTitle={table.getCellTitle}
      />
      <AdminTableFooter
        {...table.getRange(pagination.totalEntries)}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalEntries={pagination.totalEntries}
        onPrevious={() => table.handlePage(pagination.page - 1)}
        onNext={() => table.handlePage(pagination.page + 1)}
      />
    </div>
  );
}
