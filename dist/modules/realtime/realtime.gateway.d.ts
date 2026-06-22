import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DomainEventEnvelope } from './realtime.events';
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly jwt;
    private readonly config;
    private readonly logger;
    private server;
    constructor(jwt: JwtService, config: ConfigService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    broadcast(envelope: DomainEventEnvelope): void;
    private extractToken;
}
