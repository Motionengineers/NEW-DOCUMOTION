import { z } from 'zod';
import { ApiError } from '@/lib/api-error';

export async function validateBody(schema, body) {
  const result = await schema.safeParseAsync(body);
  if (!result.success) {
    const message = result.error.issues.map(issue => issue.message).join('; ');
    throw new ApiError(400, message || 'Invalid request body');
  }
  return result.data;
}

export async function validateQuery(schema, searchParams) {
  const params = Object.fromEntries(searchParams.entries());
  return validateBody(schema, params);
}

export const createPostSchema = z.object({
  body: z.string().optional(),
  stage: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  linkUrl: z.string().optional(),
  linkTitle: z.string().optional(),
  linkDescription: z.string().optional(),
  linkImageUrl: z.string().optional(),
  template: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  professional: z.boolean().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  media: z.array(z.object({ type: z.string().optional(), url: z.string() })).optional(),
  mediaUrl: z.string().optional(),
  startupId: z.union([z.number(), z.string()]).optional(),
  embedUrl: z.string().optional(),
});
