"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
exports.buildEvent = buildEvent;
exports.DomainEvent = {
    ComputerCreated: 'computer.created',
    ComputerUpdated: 'computer.updated',
    SessionStarted: 'session.started',
    SessionExtended: 'session.extended',
    SessionEnded: 'session.ended',
    DebtCreated: 'debt.created',
    DebtUpdated: 'debt.updated',
    AnalyticsUpdated: 'analytics.updated',
};
function buildEvent(event, payload) {
    return { event, payload, at: new Date().toISOString() };
}
//# sourceMappingURL=realtime.events.js.map