"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
        value: node_crypto_1.webcrypto,
        configurable: true,
        enumerable: false,
        writable: false,
    });
}
//# sourceMappingURL=polyfills.js.map