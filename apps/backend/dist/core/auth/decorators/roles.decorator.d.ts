import { UserRole } from '../enums/user-role.enum';
export declare const ROLES_KEY = "roles";
export declare const RequireRoles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSIONS_KEY = "permissions";
export declare const RequirePermissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
