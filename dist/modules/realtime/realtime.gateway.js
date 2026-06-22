"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const event_emitter_1 = require("@nestjs/event-emitter");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const realtime_events_1 = require("./realtime.events");
const REALTIME_CORS_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwt;
    config;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    server;
    constructor(jwt, config) {
        this.jwt = jwt;
        this.config = config;
    }
    afterInit() {
        this.logger.log('Realtime gateway initialised on /realtime');
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.config.get('auth.accessSecret'),
            });
            client.data.user = payload;
            await client.join(`role:${payload.role}`);
            this.logger.debug(`Client ${client.id} connected as ${payload.email}`);
        }
        catch {
            client.emit('error', { message: 'Unauthorized' });
            client.disconnect(true);
        }
    }
    broadcast(envelope) {
        if (!this.server) {
            return;
        }
        this.server.emit(envelope.event, envelope);
    }
    extractToken(client) {
        const authToken = client.handshake.auth?.token;
        if (authToken) {
            return authToken.replace(/^Bearer\s+/i, '');
        }
        const header = client.handshake.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            return header.slice(7);
        }
        const cookie = client.handshake.headers.cookie ?? '';
        const match = cookie.match(/access_token=([^;]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        }
        throw new Error('No token');
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.ComputerCreated),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.ComputerUpdated),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.SessionStarted),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.SessionExtended),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.SessionEnded),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.DebtCreated),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.DebtUpdated),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.AnalyticsUpdated),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "broadcast", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/realtime',
        cors: { origin: REALTIME_CORS_ORIGINS, credentials: true },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map