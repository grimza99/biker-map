import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional()
});

export const paginationSchema = z.object({
  nextCursor: z.string().nullable().optional(),
  total: z.number().optional()
});

export const listResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: paginationSchema.optional()
  });
