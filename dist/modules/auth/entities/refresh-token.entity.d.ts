export declare class RefreshToken {
    id: string;
    userId: string;
    familyId: string;
    tokenHash: string;
    revoked: boolean;
    replacedBy: string | null;
    expiresAt: Date;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
}
