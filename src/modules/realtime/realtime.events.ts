/**
 * Canonical domain event names. Services emit these via the in-process
 * EventEmitter; the realtime gateway forwards a meaningful subset to
 * connected WebSocket clients. Keeping the names here prevents drift
 * between emitters and listeners.
 */
export const DomainEvent = {
  ComputerCreated: 'computer.created',
  ComputerUpdated: 'computer.updated',
  SessionStarted: 'session.started',
  SessionExtended: 'session.extended',
  SessionEnded: 'session.ended',
  DebtCreated: 'debt.created',
  DebtUpdated: 'debt.updated',
  AnalyticsUpdated: 'analytics.updated',
} as const;

export type DomainEventName = (typeof DomainEvent)[keyof typeof DomainEvent];

export interface DomainEventEnvelope<T = unknown> {
  event: DomainEventName;
  payload: T;
  at: string;
}

export function buildEvent<T>(
  event: DomainEventName,
  payload: T,
): DomainEventEnvelope<T> {
  return { event, payload, at: new Date().toISOString() };
}
