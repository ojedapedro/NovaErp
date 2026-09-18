import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

// Matriz de permisos mutuamente excluyentes (Segregation of Duties)
export const SOD_RESTRICTIONS: [string, string][] = [
  ['invoices:create', 'bank:reconcile'],
  ['journal:create', 'journal:approve'],
  ['payroll:calculate', 'payroll:disburse'],
];

@Injectable()
export class SegregationOfDutiesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userPermissions: string[] = request.user?.permissions || [];
    const userRole: string = request.user?.role;

    if (userRole === 'ADMIN') {
      return true; // ADMIN bypasses SoD restrictions for demo purposes
    }

    for (const [permA, permB] of SOD_RESTRICTIONS) {
      if (userPermissions.includes(permA) && userPermissions.includes(permB)) {
        throw new ForbiddenException(
          `Violación de Segregación de Funciones: El usuario no puede poseer simultáneamente los permisos [${permA}] y [${permB}].`
        );
      }
    }
    
    return true;
  }
}
