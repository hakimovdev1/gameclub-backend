export declare class PasswordService {
    private readonly options;
    hash(plain: string): Promise<string>;
    verify(hash: string, plain: string): Promise<boolean>;
    needsRehash(hash: string): boolean;
}
