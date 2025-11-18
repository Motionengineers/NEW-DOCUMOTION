import { getToken } from 'next-auth/jwt';
import { jsonError } from './http';
import { z } from 'zod';

export async function requireAuth(request, rid) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token.userId == null && token.sub == null)) {
    return { errorResponse: jsonError('unauthorized', 'Unauthorized', 401, rid) };
  }
  const userIdCandidate = token.userId ?? token.sub;
  const parsed = z.coerce.number().int().positive().safeParse(userIdCandidate);
  if (!parsed.success) {
    return { errorResponse: jsonError('unauthorized', 'Unauthorized', 401, rid) };
  }
  return { userId: parsed.data, token };
}

export function hasRole(token, roles) {
  if (!token?.role) return false;
  return roles.includes(token.role);
}

export function requireRoleOrOwner(token, ownerUserId, roles = ['admin']) {
  const isOwner = ownerUserId != null && Number(token?.userId ?? token?.sub) === Number(ownerUserId);
  const isAllowedRole = hasRole(token, roles);
  return isOwner || isAllowedRole;
}


