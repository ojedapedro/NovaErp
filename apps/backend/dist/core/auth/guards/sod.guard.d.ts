import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare const SOD_RESTRICTIONS: [string, string][];
export declare class SegregationOfDutiesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
