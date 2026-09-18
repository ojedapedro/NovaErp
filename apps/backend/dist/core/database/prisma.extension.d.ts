import { Prisma, PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
export declare const createExtendedPrismaClient: (prisma: PrismaClient, cls: ClsService) => import("@prisma/client/runtime/library").DynamicClientExtensionThis<Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {};
}, Prisma.PrismaClientOptions>, Prisma.TypeMapCb, {
    result: {};
    model: {};
    query: {};
    client: {};
}, {}>;
