"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = require("./config/configuration");
const env_validation_1 = require("./config/env.validation");
const database_module_1 = require("./database/database.module");
const common_module_1 = require("./common/common.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const audit_interceptor_1 = require("./modules/audit/audit.interceptor");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
const audit_module_1 = require("./modules/audit/audit.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const rooms_module_1 = require("./modules/rooms/rooms.module");
const computers_module_1 = require("./modules/computers/computers.module");
const customers_module_1 = require("./modules/customers/customers.module");
const debt_module_1 = require("./modules/debt/debt.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const settings_module_1 = require("./modules/settings/settings.module");
const realtime_module_1 = require("./modules/realtime/realtime.module");
const health_module_1 = require("./modules/health/health.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: configuration_1.configurations,
                validate: env_validation_1.validateEnv,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            jwt_1.JwtModule.register({}),
            throttler_1.ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
            database_module_1.DatabaseModule,
            common_module_1.CommonModule,
            audit_module_1.AuditModule,
            realtime_module_1.RealtimeModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            rooms_module_1.RoomsModule,
            computers_module_1.ComputersModule,
            customers_module_1.CustomersModule,
            debt_module_1.DebtModule,
            sessions_module_1.SessionsModule,
            analytics_module_1.AnalyticsModule,
            notifications_module_1.NotificationsModule,
            settings_module_1.SettingsModule,
            health_module_1.HealthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map