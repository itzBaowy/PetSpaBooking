import { z } from "zod";
import type { ApiResponse } from "@/types/api";

export const paginationSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
  totalItems: z.number().catch(0),
  totalPages: z.number().catch(0),
  hasNextPage: z.boolean().optional(),
  hasPrevPage: z.boolean().optional(),
});

export const entitySchema = z.object({ id: z.string().catch("").default("") }).passthrough();
export const listSchema = z.preprocess((input) => {
  if (Array.isArray(input)) {
    return {
      items: input,
      pagination: {
        page: 1,
        pageSize: input.length || 10,
        totalItems: input.length,
        totalPages: input.length ? 1 : 0,
      },
    };
  }

  if (!input || typeof input !== "object") {
    return {
      items: [],
      pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    };
  }

  const data = input as Record<string, unknown>;
  if (data.pagination) return data;

  const items = Array.isArray(data.items) ? data.items : [];
  return {
    items,
    pagination: {
      page: data.page ?? 1,
      pageSize: data.pageSize ?? 10,
      totalItems: data.totalItems ?? data.totalItem ?? items.length,
      totalPages: data.totalPages ?? data.totalPage ?? (items.length ? 1 : 0),
    },
  };
}, z.object({
  items: z.array(entitySchema).catch([]),
  pagination: paginationSchema,
}));

export type AdminEntity = z.infer<typeof entitySchema>;
export type AdminList = z.infer<typeof listSchema>;

export function parseEntity(response: ApiResponse<unknown>): AdminEntity {
  return entitySchema.parse(response.data);
}

export function parseList(response: ApiResponse<unknown>): AdminList {
  return listSchema.parse(response.data);
}

export function textValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export function nested(record: unknown, ...keys: string[]): unknown {
  let value: unknown = record;
  for (const key of keys) {
    if (!value || typeof value !== "object") return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}
