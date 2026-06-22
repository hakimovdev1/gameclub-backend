import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: string;
  entity: string;
}

/**
 * Marks a write endpoint for automatic audit capture. The interceptor
 * records actor, IP, user-agent, request id and the resulting entity.
 */
export const Audited = (action: string, entity: string) =>
  SetMetadata(AUDIT_KEY, { action, entity } satisfies AuditMetadata);
