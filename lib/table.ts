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
    perPage: [10, 20, 30, 50, 100].includes(rawPerPage) ? rawPerPage : 10,
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
