import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

loadEnv();

/**
 * Standalone DataSource used by the TypeORM CLI for generating and running
 * migrations. The runtime app builds its own connection from typed config
 * (see DatabaseModule); both point at the same entities/migrations so the
 * schema the CLI manages is exactly the one the app expects.
 */
export const dataSourceOptions: DataSourceOptions = {
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

export default new DataSource(dataSourceOptions);
