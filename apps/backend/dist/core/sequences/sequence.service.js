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
exports.SequenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let SequenceService = class SequenceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextVoucherNumber(companyId, prefix) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const lastWithholding = await this.prisma.ivaWithholding.findFirst({
            where: { companyId, voucherNumber: { startsWith: dateStr } },
            orderBy: { voucherNumber: 'desc' }
        });
        let seq = 1;
        if (lastWithholding && lastWithholding.voucherNumber.length > 8) {
            const lastSeq = parseInt(lastWithholding.voucherNumber.slice(-8), 10);
            if (!isNaN(lastSeq))
                seq = lastSeq + 1;
        }
        return `${dateStr}${seq.toString().padStart(8, '0')}`;
    }
    async nextReceiptNumber(companyId, type) {
        const prefix = `REC-${type}-`;
        let lastPayment;
        if (type === 'CXC') {
            lastPayment = await this.prisma.customerPayment.findFirst({
                where: { companyId, receiptNumber: { startsWith: prefix } },
                orderBy: { receiptNumber: 'desc' }
            });
        }
        else {
            lastPayment = await this.prisma.supplierPayment.findFirst({
                where: { companyId, receiptNumber: { startsWith: prefix } },
                orderBy: { receiptNumber: 'desc' }
            });
        }
        let seq = 1;
        if (lastPayment && lastPayment.receiptNumber) {
            const lastSeq = parseInt(lastPayment.receiptNumber.replace(prefix, ''), 10);
            if (!isNaN(lastSeq))
                seq = lastSeq + 1;
        }
        return `${prefix}${seq.toString().padStart(6, '0')}`;
    }
};
exports.SequenceService = SequenceService;
exports.SequenceService = SequenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SequenceService);
//# sourceMappingURL=sequence.service.js.map