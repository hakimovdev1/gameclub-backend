"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
(0, dotenv_1.config)();
exports.dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'hakimov',
    password: process.env.DB_PASSWORD ?? 'YourStrongPassword',
    database: process.env.DB_DATABASE ?? 'gameclub',
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
};
exports.default = new typeorm_1.DataSource(exports.dataSourceOptions);
//# sourceMappingURL=data-source.js.map