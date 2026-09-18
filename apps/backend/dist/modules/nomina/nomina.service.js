"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let NominaService = class NominaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployees(companyId) {
        return this.prisma.employee.findMany({
            where: { companyId },
            orderBy: { lastName: "asc" }
        });
    }
    async createEmployee(companyId, dto) {
        return this.prisma.employee.create({
            data: {
                ...dto,
                companyId,
                hireDate: new Date(dto.hireDate)
            }
        });
    }
    async getPeriods(companyId) {
        return this.prisma.payrollPeriod.findMany({
            where: { companyId },
            orderBy: { startDate: "desc" },
            include: { items: true }
        });
    }
    async createPeriod(companyId, dto) {
        return this.prisma.payrollPeriod.create({
            data: {
                companyId,
                periodName: dto.periodName,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate)
            }
        });
    }
    async calculatePayroll(companyId, periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
        if (!period || period.companyId !== companyId) {
            throw new common_1.BadRequestException("Período no encontrado");
        }
        if (period.status !== "DRAFT") {
            throw new common_1.BadRequestException("El período ya fue procesado");
        }
        const employees = await this.prisma.employee.findMany({
            where: { companyId, status: "ACTIVE" }
        });
        const items = [];
        const IVSS_RATE = 0.04;
        const FAOV_RATE = 0.01;
        const INCES_RATE = 0.005;
        for (const emp of employees) {
            const baseSalary = Number(emp.baseSalary);
            const bonos = 0;
            const otrosIngresos = 0;
            const totalIngresos = baseSalary + bonos + otrosIngresos;
            const deduccionIvss = baseSalary * IVSS_RATE;
            const deduccionFaov = baseSalary * FAOV_RATE;
            const deduccionInces = baseSalary * INCES_RATE;
            const islrRetenido = 0;
            const otrasDeduciones = 0;
            const totalDeducciones = deduccionIvss + deduccionFaov + deduccionInces + islrRetenido + otrasDeduciones;
            const netoPagar = totalIngresos - totalDeducciones;
            const item = await this.prisma.payrollItem.upsert({
                where: {
                    payrollPeriodId_employeeId: {
                        payrollPeriodId: periodId,
                        employeeId: emp.id
                    }
                },
                create: {
                    payrollPeriodId: periodId,
                    employeeId: emp.id,
                    baseSalary,
                    bonos,
                    otrosIngresos,
                    totalIngresos,
                    deduccionIvss,
                    deduccionFaov,
                    deduccionInces,
                    islrRetenido,
                    otrasDeduciones,
                    totalDeducciones,
                    netoPagar
                },
                update: {
                    baseSalary,
                    totalIngresos,
                    deduccionIvss,
                    deduccionFaov,
                    deduccionInces,
                    totalDeducciones,
                    netoPagar
                }
            });
            items.push(item);
        }
        return { success: true, processed: items.length };
    }
};
exports.NominaService = NominaService;
exports.NominaService = NominaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NominaService);
//# sourceMappingURL=nomina.service.js.map