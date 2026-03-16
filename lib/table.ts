export type TableParams = {
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export type TableResult<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Single source of truth for valid perPage options */
export const VALID_PER_PAGE = [10, 20, 30, 50, 100] as const;

/** Shared page component prop type for server pages that use table params */
export type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

/**
 * Builds a Prisma-compatible orderBy object from a sort key and direction.
 * Pass all valid sort keys in fieldMap (key → DB field name). Any unrecognised
 * sort key falls back to defaultField, preventing arbitrary field injection.
 */
export function buildOrderBy(
  sort: string,
  order: "asc" | "desc",
  fieldMap: Record<string, string>,
  defaultField = "created_at",
): Record<string, "asc" | "desc"> {
  const field = fieldMap[sort] ?? defaultField;
  return { [field]: order };
}

export function parseTableParams(
  params: RawSearchParams,
  defaultSort = "name",
): Required<TableParams> {
  const rawPage = Number(params.page);
  const rawPerPage = Number(params.perPage);

  return {
    search:
      typeof params.search === "string" && params.search ? params.search : "",
    page: rawPage > 0 ? rawPage : 1,
    perPage: (VALID_PER_PAGE as readonly number[]).includes(rawPerPage)
      ? rawPerPage
      : 10,
    sort:
      typeof params.sort === "string" && params.sort
        ? params.sort
        : defaultSort,
    order: params.order === "asc" ? "asc" : "desc",
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return { total, page, perPage, totalPages };
}

/** Pagination shape used by AdminPage */
export type Pagination = {
  page: number;
  perPage: number;
  totalPages: number;
  totalEntries: number;
};

/** Maps a fetcher result to the AdminPage pagination prop shape and converts `total` → `totalEntries` to match the component interface */
export function toPagination(result: {
  page: number;
  perPage: number;
  totalPages: number;
  total: number;
}) {
  return {
    page: result.page,
    perPage: result.perPage,
    totalPages: result.totalPages,
    totalEntries: result.total,
  };
}
