import { logger } from '@/lib/logger';

export const AUDIT_ACTIONS = {
  API_ACCESS: 'api_access',
  API_ERROR: 'api_error',
};

export async function auditLog(entry = {}) {
  logger.info({
    event: 'audit_log',
    ...entry,
  });
}
