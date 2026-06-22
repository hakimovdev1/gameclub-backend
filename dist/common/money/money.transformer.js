"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneyColumnTransformer = void 0;
exports.moneyColumnTransformer = {
    to(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return Math.trunc(value).toString();
    },
    from(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return parseInt(value, 10);
    },
};
//# sourceMappingURL=money.transformer.js.map