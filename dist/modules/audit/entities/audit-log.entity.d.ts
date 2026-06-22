export declare class AuditLog {
    id: string;
    actorId: string | null;
    actorEmail: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    oldValue: unknown;
    newValue: unknown;
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string | null;
    createdAt: Date;
}
