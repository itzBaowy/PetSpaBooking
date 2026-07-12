export interface PrismaQuery {
  page: number;
  pageSize: number;
  index: number;
  where: Record<string, unknown>;
}

export function buildQueryPrisma(query: Record<string, unknown>): PrismaQuery {
  const PAGE_DEFAULT = 1;
  const PAGE_SIZE_DEFAULT = 10;

  let page = Number(query.page) || PAGE_DEFAULT;
  let pageSize = Number(query.pageSize) || PAGE_SIZE_DEFAULT;

  page = Math.max(page, PAGE_DEFAULT);
  pageSize = Math.max(pageSize, PAGE_SIZE_DEFAULT);

  let rawFilters: Record<string, unknown> = {};

  if (query.filters) {
    try {
      const parsed = JSON.parse(query.filters as string);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        rawFilters = parsed as Record<string, unknown>;
      }
    } catch {
      rawFilters = {};
    }
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawFilters)) {
    if (typeof value === "string") {
      sanitized[key] = {
        contains: value,
        mode: "insensitive",
      };
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }

  const index = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    index,
    where: { ...sanitized },
  };
}
