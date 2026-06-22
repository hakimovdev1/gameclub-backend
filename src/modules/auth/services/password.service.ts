import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Centralised password hashing using Argon2id with memory-hard
 * parameters tuned for interactive logins. Keeping this in one place lets
 * us raise the cost factors over time and rehash on next login.
 */
@Injectable()
export class PasswordService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  };

  hash(plain: string): Promise<string> {
    return argon2.hash(plain, this.options);
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain).catch(() => false);
  }

  /** True when the stored hash was produced with weaker parameters. */
  needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, this.options);
  }
}
