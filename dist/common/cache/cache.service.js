"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = class CacheService {
    store = new Map();
    get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key, value, ttlSeconds) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    del(key) {
        this.store.delete(key);
    }
    delByPrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }
    async getOrSet(key, ttlSeconds, factory) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const fresh = await factory();
        this.set(key, fresh, ttlSeconds);
        return fresh;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map