import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache/cache.service';

/**
 * Cross-cutting providers shared by every feature module. Global so the
 * cache (and future shared infrastructure) is injectable everywhere
 * without re-importing.
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CommonModule {}
