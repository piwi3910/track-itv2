import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const searchSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().cuid(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type IdParam = z.infer<typeof idParamSchema>;