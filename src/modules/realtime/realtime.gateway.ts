import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DomainEvent, DomainEventEnvelope } from './realtime.events';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

/**
 * Authenticated, event-driven WebSocket layer. Clients must present a
 * valid access token (handshake `auth.token`, `Authorization` header, or
 * the access cookie) or they are disconnected immediately. The gateway is
 * a pure fan-out of in-process domain events — there is no polling, and
 * only meaningful business events are forwarded.
 */
/**
 * CORS allow-list for the socket handshake. Resolved from CORS_ORIGINS at
 * module-load time (decorator metadata is static). Never reflect an
 * arbitrary origin while allowing credentials — that would let any site
 * open an authenticated socket on the user's behalf.
 */
const REALTIME_CORS_ORIGINS = (
  process.env.CORS_ORIGINS ?? 'http://localhost:3000'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: REALTIME_CORS_ORIGINS, credentials: true },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(): void {
    this.logger.log('Realtime gateway initialised on /realtime');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
        secret: this.config.get<string>('auth.accessSecret'),
      });
      (client.data as { user?: AuthenticatedUser }).user = payload;
      // Role-scoped room so we can target privileged events later if needed.
      await client.join(`role:${payload.role}`);
      this.logger.debug(`Client ${client.id} connected as ${payload.email}`);
    } catch {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  // ---- Domain event forwarders -------------------------------------------

  @OnEvent(DomainEvent.ComputerCreated)
  @OnEvent(DomainEvent.ComputerUpdated)
  @OnEvent(DomainEvent.SessionStarted)
  @OnEvent(DomainEvent.SessionExtended)
  @OnEvent(DomainEvent.SessionEnded)
  @OnEvent(DomainEvent.DebtCreated)
  @OnEvent(DomainEvent.DebtUpdated)
  @OnEvent(DomainEvent.AnalyticsUpdated)
  broadcast(envelope: DomainEventEnvelope): void {
    if (!this.server) {
      return;
    }
    this.server.emit(envelope.event, envelope);
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token as string | undefined;
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
}
