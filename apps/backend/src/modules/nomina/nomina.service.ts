import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class NominaService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= Empleados =================
  async getEmployees(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
      orderBy: { lastName: "asc" }
    });
  }

  async createEmployee(companyId: string, dto: any) {
    return this.prisma.employee.create({
      data: {
        ...dto,
        companyId,
        hireDate: new Date(dto.hireDate)
      }
    });
  }

  // ================= Períodos y Cálculos =================
  async getPeriods(companyId: string) {
    return this.prisma.payrollPeriod.findMany({
      where: { companyId },
      orderBy: { startDate: "desc" },
      include: { items: true }
    });
  }

  async createPeriod(companyId: string, dto: any) {
    return this.prisma.payrollPeriod.create({
      data: {
        companyId,
        periodName: dto.periodName,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate)
      }
    });
  }

  async calculatePayroll(companyId: string, periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period || period.companyId !== companyId) {
      throw new BadRequestException("Período no encontrado");
    }
    if (period.status !== "DRAFT") {
      throw new BadRequestException("El período ya fue procesado");
    }

    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: "ACTIVE" }
    });

    const items = [];
    
    // Parámetros básicos de ley venezolana (Simplificados para el ERP)
    // IVSS: 4% (Trabajador)
    // FAOV: 1% (Trabajador)
    // INCES: 0.5% (Trabajador)
    const IVSS_RATE = 0.04;
    const FAOV_RATE = 0.01;
    const INCES_RATE = 0.005;

    for (const emp of employees) {
      const baseSalary = Number(emp.baseSalary);
      const bonos = 0; // Podría venir de un array de conceptos
      const otrosIngresos = 0;
      
      const totalIngresos = baseSalary + bonos + otrosIngresos;

      // Cálculos de deducciones
      const deduccionIvss = baseSalary * IVSS_RATE;
      const deduccionFaov = baseSalary * FAOV_RATE;
      const deduccionInces = baseSalary * INCES_RATE;
      const islrRetenido = 0; // Depende de AR-I, se asume 0 para simplificar
      const otrasDeduciones = 0;

      const totalDeducciones = deduccionIvss + deduccionFaov + deduccionInces + islrRetenido + otrasDeduciones;
      const netoPagar = totalIngresos - totalDeducciones;

      // Upsert para no duplicar si se recalcula
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
}
