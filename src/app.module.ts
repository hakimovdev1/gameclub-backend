import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { configurations } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ComputersModule } from './modules/computers/computers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DebtModule } from './modules/debt/debt.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    // Registered at the root so the global JwtAuthGuard can resolve JwtService.
    JwtModule.register({}),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    CommonModule,

    // Global infrastructure
    AuditModule,
    RealtimeModule,

    // Feature modules
    AuthModule,
    UsersModule,
    RoomsModule,
    ComputersModule,
    CustomersModule,
    DebtModule,
    SessionsModule,
    AnalyticsModule,
    NotificationsModule,
    SettingsModule,
    HealthModule,
  ],
  providers: [
    // Order matters: throttle -> authenticate -> authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Audit first (sees the result), then envelope formatting.
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
