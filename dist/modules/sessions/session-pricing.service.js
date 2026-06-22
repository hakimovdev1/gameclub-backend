"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionPricingService = void 0;
const common_1 = require("@nestjs/common");
const money_1 = require("../../common/money/money");
const session_entity_1 = require("./entities/session.entity");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const SECONDS_PER_MINUTE = 60;
let SessionPricingService = class SessionPricingService {
    plan(type, ratePerHour, startedAt, params) {
        switch (type) {
            case session_entity_1.SessionType.FIXED_DURATION: {
                const minutes = params.durationMinutes;
                if (!minutes || minutes <= 0) {
                    throw new domain_exception_1.BusinessRuleException('INVALID_DURATION', 'FIXED_DURATION requires a positive durationMinutes');
                }
                const seconds = minutes * SECONDS_PER_MINUTE;
                return {
                    plannedEndAt: new Date(startedAt.getTime() + seconds * 1000),
                    plannedAmount: money_1.Money.forDuration(ratePerHour, seconds),
                };
            }
            case session_entity_1.SessionType.FIXED_END_TIME: {
                const end = params.plannedEndAt;
                if (!end) {
                    throw new domain_exception_1.BusinessRuleException('INVALID_END_TIME', 'FIXED_END_TIME requires plannedEndAt');
                }
                const seconds = this.diffSeconds(startedAt, end);
                if (seconds <= 0) {
                    throw new domain_exception_1.BusinessRuleException('INVALID_END_TIME', 'plannedEndAt must be after the start time');
                }
                return {
                    plannedEndAt: end,
                    plannedAmount: money_1.Money.forDuration(ratePerHour, seconds),
                };
            }
            case session_entity_1.SessionType.OPEN_SESSION:
                return { plannedEndAt: null, plannedAmount: money_1.Money.ZERO };
            default:
                throw new domain_exception_1.BusinessRuleException('INVALID_SESSION_TYPE', 'Unknown type');
        }
    }
    quote(session, now) {
        if (session.type === session_entity_1.SessionType.OPEN_SESSION) {
            const seconds = this.diffSeconds(session.startedAt, now);
            return money_1.Money.forDuration(session.ratePerHour, Math.max(seconds, 0));
        }
        return money_1.Money.fromMinor(session.amountDue);
    }
    finalize(session, endedAt) {
        if (session.type === session_entity_1.SessionType.OPEN_SESSION) {
            const seconds = this.diffSeconds(session.startedAt, endedAt);
            return money_1.Money.forDuration(session.ratePerHour, Math.max(seconds, 0));
        }
        return money_1.Money.fromMinor(session.amountDue);
    }
    extend(session, params) {
        switch (session.type) {
            case session_entity_1.SessionType.FIXED_DURATION: {
                if (!params.addMinutes || params.addMinutes <= 0) {
                    throw new domain_exception_1.BusinessRuleException('INVALID_EXTENSION', 'FIXED_DURATION extension requires positive addMinutes');
                }
                const base = session.plannedEndAt ?? session.startedAt;
                const newEnd = new Date(base.getTime() + params.addMinutes * SECONDS_PER_MINUTE * 1000);
                const totalSeconds = this.diffSeconds(session.startedAt, newEnd);
                return {
                    plannedEndAt: newEnd,
                    plannedAmount: money_1.Money.forDuration(session.ratePerHour, totalSeconds),
                };
            }
            case session_entity_1.SessionType.FIXED_END_TIME: {
                if (!params.newEndAt) {
                    throw new domain_exception_1.BusinessRuleException('INVALID_EXTENSION', 'FIXED_END_TIME extension requires newEndAt');
                }
                if (session.plannedEndAt &&
                    params.newEndAt.getTime() <= session.plannedEndAt.getTime()) {
                    throw new domain_exception_1.BusinessRuleException('INVALID_EXTENSION', 'newEndAt must be later than the current planned end');
                }
                const totalSeconds = this.diffSeconds(session.startedAt, params.newEndAt);
                return {
                    plannedEndAt: params.newEndAt,
                    plannedAmount: money_1.Money.forDuration(session.ratePerHour, totalSeconds),
                };
            }
            default:
                throw new domain_exception_1.BusinessRuleException('CANNOT_EXTEND', 'OPEN_SESSION cannot be extended; simply end it when finished');
        }
    }
    diffSeconds(from, to) {
        return Math.round((to.getTime() - from.getTime()) / 1000);
    }
};
exports.SessionPricingService = SessionPricingService;
exports.SessionPricingService = SessionPricingService = __decorate([
    (0, common_1.Injectable)()
], SessionPricingService);
//# sourceMappingURL=session-pricing.service.js.map