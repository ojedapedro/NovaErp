import { Prisma, PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

// Utility to calculate JSON diff between old and new state
function calculateDiff(before: Record<string, any>, after: Record<string, any>) {
  const diff: Record<string, { before: any; after: any }> = {};
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  for (const key of allKeys) {
    if (['updatedAt', 'created_at'].includes(key)) continue;
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = { before: before[key], after: after[key] };
    }
  }
  return diff;
}

export const createExtendedPrismaClient = (prisma: PrismaClient, cls: ClsService) => {
  return prisma.$extends({
    name: 'TenantAndAudit',
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          const companyId = cls.get<string>('companyId');
          // Automatically filter by companyId if model has companyId field
          const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name === model)?.fields.map(f => f.name) ?? [];
          if (companyId && modelFields.includes('companyId')) {
            args.where = { ...args.where, companyId };
          }
          return query(args);
        },
        async create({ model, operation, args, query }) {
          const companyId = cls.get<string>('companyId');
          const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name === model)?.fields.map(f => f.name) ?? [];
          if (companyId && modelFields.includes('companyId') && !(args.data as any)['companyId']) {
            (args.data as any)['companyId'] = companyId;
          }

          // Let query run first to get the generated ID
          const result = await query(args);

          // Audit Log creation
          if (model !== 'AuditLog') {
            const userId = cls.get<string>('userId');
            const ipAddress = cls.get<string>('ipAddress');
            
            await (prisma as any).auditLog.create({
              data: {
                companyId,
                userId,
                ipAddress,
                action: 'CREATE',
                tableName: model,
                recordId: String((result as any).id),
                newValues: result as Prisma.InputJsonValue,
              },
            });
          }

          return result;
        },
        async update({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);

          const userId = cls.get<string>('userId');
          const companyId = cls.get<string>('companyId');
          const ipAddress = cls.get<string>('ipAddress');

          // Fetch current record state before update
          const before = await (prisma as any)[model].findUnique({ where: args.where });

          // Perform the update
          const result = await query(args);

          // Compute diff and insert audit record
          const diff = calculateDiff(before, result as Record<string, any>);
          if (Object.keys(diff).length > 0) {
            await (prisma as any).auditLog.create({
              data: {
                companyId,
                userId,
                ipAddress,
                action: 'UPDATE',
                tableName: model,
                recordId: String((result as any).id),
                oldValues: before as Prisma.InputJsonValue,
                newValues: result as Prisma.InputJsonValue,
                changesDiff: diff as Prisma.InputJsonValue,
              },
            });
          }

          return result;
        },
        async delete({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);

          const userId = cls.get<string>('userId');
          const companyId = cls.get<string>('companyId');
          const ipAddress = cls.get<string>('ipAddress');

          const before = await (prisma as any)[model].findUnique({ where: args.where });
          const result = await query(args);

          await (prisma as any).auditLog.create({
            data: {
              companyId,
              userId,
              ipAddress,
              action: 'DELETE',
              tableName: model,
              recordId: String((result as any).id),
              oldValues: before as Prisma.InputJsonValue,
            },
          });

          return result;
        }
      },
    },
  });
};
