import { z } from "zod";

export const bankSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  bin: z.string(),
  shortName: z.string(),
  logo: z.string(),
  transferSupported: z.number(),
  lookupSupported: z.number(),
});

export type Bank = z.infer<typeof bankSchema>;
