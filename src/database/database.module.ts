import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Runtime database wiring. Connection parameters come from typed config;
 * `synchronize` is opt-in (development only) — production relies on
 * migrations. `citext` is required by the users table for case-insensitive
 * email uniqueness, so the extension is ensured at connect time.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('database.synchronize') ?? false,
        logging: config.get<boolean>('database.logging') ?? false,
        // Pool sizing for the 1000+ concurrent-session target.
        extra: { max: 20, connectionTimeoutMillis: 5_000 },
      }),
    }),
  ],
})
export class DatabaseModule {}
