export declare const AUDIT_KEY = "audit";
export interface AuditMetadata {
    action: string;
    entity: string;
}
export declare const Audited: (action: string, entity: string) => import("@nestjs/common").CustomDecorator<string>;
