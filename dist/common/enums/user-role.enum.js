"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROLE_NAMES = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["LEGAL_ADVISOR"] = "legal_advisor";
    UserRole["CUSTOMER"] = "customer";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.USER_ROLE_NAMES = {
    [UserRole.LEGAL_ADVISOR]: 'Legal Advisor',
    [UserRole.CUSTOMER]: 'Customer',
    [UserRole.ADMIN]: 'Administrator',
};
//# sourceMappingURL=user-role.enum.js.map