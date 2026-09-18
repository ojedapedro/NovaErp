import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { createExtendedPrismaClient } from './prisma.extension';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly cls;
    extended: ReturnType<typeof createExtendedPrismaClient>;
    constructor(cls: ClsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
