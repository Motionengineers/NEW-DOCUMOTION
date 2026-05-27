import { z } from 'zod';

export const UpdateStartupSchema = z.object({
  stage: z.string().optional(),
  sector: z.string().optional(),
  revenue: z.number().optional(),
  revenueBand: z.string().optional(),
  location: z.string().optional(),
  servicesNeeded: z.array(z.string()).optional(),
  specialCriteria: z.array(z.string()).optional(),
  preferredBankTypes: z.array(z.string()).optional(),
  preferredLoanMin: z.number().optional(),
  preferredLoanMax: z.number().optional(),
});
