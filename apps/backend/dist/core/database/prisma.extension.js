"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtendedPrismaClient = void 0;
const client_1 = require("@prisma/client");
function calculateDiff(before, after) {
    const diff = {};
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    for (const key of allKeys) {
        if (['updatedAt', 'created_at'].includes(key))
            continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
            diff[key] = { before: before[key], after: after[key] };
        }
    }
    return diff;
}
const createExtendedPrismaClient = (prisma, cls) => {
    return prisma.$extends({
        name: 'TenantAndAudit',
        query: {
            $allModels: {
                async findMany({ model, operation, args, query }) {
                    const companyId = cls.get('companyId');
                    const modelFields = client_1.Prisma.dmmf.datamodel.models.find(m => m.name === model)?.fields.map(f => f.name) ?? [];
                    if (companyId && modelFields.includes('companyId')) {
                        args.where = { ...args.where, companyId };
                    }
                    return query(args);
                },
                async create({ model, operation, args, query }) {
                    const companyId = cls.get('companyId');
                    const modelFields = client_1.Prisma.dmmf.datamodel.models.find(m => m.name === model)?.fields.map(f => f.name) ?? [];
                    if (companyId && modelFields.includes('companyId') && !args.data['companyId']) {
                        args.data['companyId'] = companyId;
                    }
                    const result = await query(args);
                    if (model !== 'AuditLog') {
                        const userId = cls.get('userId');
                        const ipAddress = cls.get('ipAddress');
                        await prisma.auditLog.create({
                            data: {
                                companyId,
                                userId,
                                ipAddress,
                                action: 'CREATE',
                                tableName: model,
                                recordId: String(result.id),
                                newValues: result,
                            },
                        });
                    }
                    return result;
                },
                async update({ model, operation, args, query }) {
                    if (model === 'AuditLog')
                        return query(args);
                    const userId = cls.get('userId');
                    const companyId = cls.get('companyId');
                    const ipAddress = cls.get('ipAddress');
                    const before = await prisma[model].findUnique({ where: args.where });
                    const result = await query(args);
                    const diff = calculateDiff(before, result);
                    if (Object.keys(diff).length > 0) {
                        await prisma.auditLog.create({
                            data: {
                                companyId,
                                userId,
                                ipAddress,
                                action: 'UPDATE',
                                tableName: model,
                                recordId: String(result.id),
                                oldValues: before,
                                newValues: result,
                                changesDiff: diff,
                            },
                        });
                    }
                    return result;
                },
                async delete({ model, operation, args, query }) {
                    if (model === 'AuditLog')
                        return query(args);
                    const userId = cls.get('userId');
                    const companyId = cls.get('companyId');
                    const ipAddress = cls.get('ipAddress');
                    const before = await prisma[model].findUnique({ where: args.where });
                    const result = await query(args);
                    await prisma.auditLog.create({
                        data: {
                            companyId,
                            userId,
                            ipAddress,
                            action: 'DELETE',
                            tableName: model,
                            recordId: String(result.id),
                            oldValues: before,
                        },
                    });
                    return result;
                }
            },
        },
    });
};
exports.createExtendedPrismaClient = createExtendedPrismaClient;
//# sourceMappingURL=prisma.extension.js.map