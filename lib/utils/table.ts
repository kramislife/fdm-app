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
export type SortOrder = "asc" | "desc";
export type TableSortDefaults = {
  defaultSort?: string;
  defaultOrder?: SortOrder;
};

/** Default Sort */
export const TABLE_SORT_DEFAULTS: Required<TableSortDefaults> = {
  defaultSort: "created_at",
  defaultOrder: "desc",
};

/** Single source of truth for valid perPage options */
export const VALID_PER_PAGE = [10, 20, 30, 50, 100] as const;

/** Shared page component prop type for server pages that use table params */
export type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

function resolveSortDefaults(config?: string | TableSortDefaults) {
  if (typeof config === "string") {
    return { defaultSort: config, defaultOrder: "desc" as const };
  }

  return {
    defaultSort: config?.defaultSort ?? TABLE_SORT_DEFAULTS.defaultSort,
    defaultOrder: config?.defaultOrder ?? TABLE_SORT_DEFAULTS.defaultOrder,
  };
}

/**
 * Builds a Prisma-compatible orderBy object from a sort key and direction.
 * Supports nested fields with dot notation (e.g. "ministry_type.name").
 */
export function buildOrderBy(
  sort: string,
  order: "asc" | "desc",
  fieldMap: Record<string, string>,
  defaultField = "created_at",
): any {
  const field = fieldMap[sort] ?? defaultField;

  return field.split(".").reduceRight((acc, part, index, arr) => ({
    [part]: index === arr.length - 1 ? order : acc,
  }), {} as any);
}

export function parseTableParams(
  params: RawSearchParams,
  config?: string | TableSortDefaults,
): Required<TableParams> {
  const { defaultSort, defaultOrder } = resolveSortDefaults(config);
  const rawPage = Number(params.page);
  const rawPerPage = Number(params.perPage);
  const sortValue =
    typeof params.sort === "string" && params.sort.length > 0
      ? params.sort
      : defaultSort;
  const orderValue: SortOrder =
    params.order === "asc" || params.order === "desc"
      ? params.order
      : defaultOrder;

  return {
    search:
      typeof params.search === "string" && params.search ? params.search : "",
    page: rawPage > 0 ? rawPage : 1,
    perPage: (VALID_PER_PAGE as readonly number[]).includes(rawPerPage)
      ? rawPerPage
      : 10,
    sort: sortValue,
    order: orderValue,
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
