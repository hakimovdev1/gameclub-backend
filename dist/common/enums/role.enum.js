"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.Role = void 0;
var Role;
(function (Role) {
    Role["OWNER"] = "OWNER";
    Role["MANAGER"] = "MANAGER";
    Role["CASHIER"] = "CASHIER";
})(Role || (exports.Role = Role = {}));
exports.ROLE_HIERARCHY = {
    [Role.OWNER]: [Role.OWNER, Role.MANAGER, Role.CASHIER],
    [Role.MANAGER]: [Role.MANAGER, Role.CASHIER],
    [Role.CASHIER]: [Role.CASHIER],
};
//# sourceMappingURL=role.enum.js.map