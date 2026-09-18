import { NominaService } from "./nomina.service";
export declare class NominaController {
    private readonly nominaService;
    constructor(nominaService: NominaService);
    getEmployees(companyId: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        companyId: string;
        status: string;
        phone: string | null;
        currency: string;
        cedula: string;
        firstName: string;
        lastName: string;
        hireDate: Date;
        terminationDate: Date | null;
        position: string;
        department: string | null;
        baseSalary: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createEmployee(companyId: string, dto: any): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        companyId: string;
        status: string;
        phone: string | null;
        currency: string;
        cedula: string;
        firstName: string;
        lastName: string;
        hireDate: Date;
        terminationDate: Date | null;
        position: string;
        department: string | null;
        baseSalary: import("@prisma/client/runtime/library").Decimal;
    }>;
    getPeriods(companyId: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            payrollPeriodId: string;
            employeeId: string;
            bonos: import("@prisma/client/runtime/library").Decimal;
            otrosIngresos: import("@prisma/client/runtime/library").Decimal;
            totalIngresos: import("@prisma/client/runtime/library").Decimal;
            deduccionIvss: import("@prisma/client/runtime/library").Decimal;
            deduccionFaov: import("@prisma/client/runtime/library").Decimal;
            deduccionInces: import("@prisma/client/runtime/library").Decimal;
            islrRetenido: import("@prisma/client/runtime/library").Decimal;
            otrasDeduciones: import("@prisma/client/runtime/library").Decimal;
            totalDeducciones: import("@prisma/client/runtime/library").Decimal;
            netoPagar: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        periodName: string;
        processedAt: Date | null;
    })[]>;
    createPeriod(companyId: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        periodName: string;
        processedAt: Date | null;
    }>;
    calculatePayroll(companyId: string, id: string): Promise<{
        success: boolean;
        processed: number;
    }>;
}
