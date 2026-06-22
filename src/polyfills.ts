import { webcrypto } from 'node:crypto';

/**
 * Node 18 does not expose the WebCrypto API as a global (`globalThis.crypto`
 * only became available in Node 19 and stable in Node 20). Several
 * dependencies — notably `@nestjs/typeorm`, which calls `crypto.randomUUID()`
 * during `forRootAsync` — assume the global exists. Bridge it here so the
 * application boots on Node 18 runtimes. No-op on Node 20+.
 *
 * This module MUST be imported before any module that touches the global
 * `crypto` (i.e. as the very first import of the process entry points).
 */
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    enumerable: false,
    writable: false,
  });
}
