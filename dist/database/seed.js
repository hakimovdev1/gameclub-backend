"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const argon2 = __importStar(require("argon2"));
const data_source_1 = __importDefault(require("./data-source"));
const user_entity_1 = require("../modules/users/entities/user.entity");
const role_enum_1 = require("../common/enums/role.enum");
(0, dotenv_1.config)();
async function seed() {
    const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_OWNER_PASSWORD;
    if (!email || !password) {
        throw new Error('SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD must be set to seed the owner');
    }
    await data_source_1.default.initialize();
    try {
        const repo = data_source_1.default.getRepository(user_entity_1.User);
        const existing = await repo.findOne({ where: { email } });
        if (existing) {
            console.log(`Owner ${email} already exists; nothing to do.`);
            return;
        }
        const user = repo.create({
            email,
            fullName: 'Club Owner',
            role: role_enum_1.Role.OWNER,
            passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
        });
        await repo.save(user);
        console.log(`Seeded owner account: ${email}`);
    }
    finally {
        await data_source_1.default.destroy();
    }
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map