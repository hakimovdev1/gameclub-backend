import { Injectable } from '@nestjs/common';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * A small TTL cache used to keep expensive analytics aggregations off the
 * hot path. The interface is deliberately Redis-shaped (get/set/del/
 * getOrSet with a TTL) so it can be swapped for a distributed Redis
 * implementation in a multi-branch deployment without touching callers.
 */
@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  /** Invalidate every key beginning with the given prefix. */
  delByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const fresh = await factory();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
