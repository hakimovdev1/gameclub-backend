export declare const DomainEvent: {
    readonly ComputerCreated: "computer.created";
    readonly ComputerUpdated: "computer.updated";
    readonly SessionStarted: "session.started";
    readonly SessionExtended: "session.extended";
    readonly SessionEnded: "session.ended";
    readonly DebtCreated: "debt.created";
    readonly DebtUpdated: "debt.updated";
    readonly AnalyticsUpdated: "analytics.updated";
};
export type DomainEventName = (typeof DomainEvent)[keyof typeof DomainEvent];
export interface DomainEventEnvelope<T = unknown> {
    event: DomainEventName;
    payload: T;
    at: string;
}
export declare function buildEvent<T>(event: DomainEventName, payload: T): DomainEventEnvelope<T>;
