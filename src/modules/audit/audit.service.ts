import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';

export interface AuditEntryInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly logs: Repository<AuditLog>,
  ) {}

  /**
   * Records an immutable audit entry. Auditing must never break the
   * business operation it observes, so persistence failures are logged
   * and swallowed rather than propagated.
   */
  async record(entry: AuditEntryInput): Promise<void> {
    try {
      const record = this.logs.create({
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        oldValue: this.redact(entry.oldValue) ?? null,
        newValue: this.redact(entry.newValue) ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        requestId: entry.requestId ?? null,
      });
      // New entity (no id) => INSERT. Audit rows are never updated.
      await this.logs.save(record);
    } catch (err) {
      this.logger.error(
        `Failed to persist audit log for ${entry.action}/${entry.entity}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<AuditLog>> {
    const [items, total] = await this.logs.findAndCount({
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  /** Strip secrets before they ever reach the audit table. */
  private redact(value: unknown): unknown {
    if (!value || typeof value !== 'object') {
      return value;
    }
    const sensitive = ['password', 'passwordHash', 'token', 'refreshToken'];
    if (Array.isArray(value)) {
      return (value as unknown[]).map((item) => this.redact(item));
    }
    const clone: Record<string, unknown> = {
      ...(value as Record<string, unknown>),
    };
    for (const key of Object.keys(clone)) {
      if (sensitive.includes(key)) {
        clone[key] = '[REDACTED]';
      }
    }
    return clone;
  }
}
