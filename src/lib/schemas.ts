import { z } from "zod";

export const searchParamsSchema = z.object({
  query: z.string().default(""),
  page: z
    .string()
    .default("1")
    .transform((val) => parseInt(val))
    .or(z.number().default(1)),
  limit: z
    .string()
    .default("10")
    .transform((val) => parseInt(val))
    .or(z.number().default(10)),
});
