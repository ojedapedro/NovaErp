"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegregationOfDutiesGuard = exports.SOD_RESTRICTIONS = void 0;
const common_1 = require("@nestjs/common");
exports.SOD_RESTRICTIONS = [
    ['invoices:create', 'bank:reconcile'],
    ['journal:create', 'journal:approve'],
    ['payroll:calculate', 'payroll:disburse'],
];
let SegregationOfDutiesGuard = class SegregationOfDutiesGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userPermissions = request.user?.permissions || [];
        const userRole = request.user?.role;
        if (userRole === 'ADMIN') {
            return true;
        }
        for (const [permA, permB] of exports.SOD_RESTRICTIONS) {
            if (userPermissions.includes(permA) && userPermissions.includes(permB)) {
                throw new common_1.ForbiddenException(`Violación de Segregación de Funciones: El usuario no puede poseer simultáneamente los permisos [${permA}] y [${permB}].`);
            }
        }
        return true;
    }
};
exports.SegregationOfDutiesGuard = SegregationOfDutiesGuard;
exports.SegregationOfDutiesGuard = SegregationOfDutiesGuard = __decorate([
    (0, common_1.Injectable)()
], SegregationOfDutiesGuard);
//# sourceMappingURL=sod.guard.js.map