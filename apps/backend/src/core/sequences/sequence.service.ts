import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) {}

  async nextVoucherNumber(companyId: string, prefix: string): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastWithholding = await this.prisma.ivaWithholding.findFirst({
      where: { companyId, voucherNumber: { startsWith: dateStr } },
      orderBy: { voucherNumber: 'desc' }
    });
    
    let seq = 1;
    if (lastWithholding && lastWithholding.voucherNumber.length > 8) {
      const lastSeq = parseInt(lastWithholding.voucherNumber.slice(-8), 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${dateStr}${seq.toString().padStart(8, '0')}`;
  }

  async nextReceiptNumber(companyId: string, type: 'CXC' | 'CXP'): Promise<string> {
    const prefix = `REC-${type}-`;
    
    let lastPayment;
    if (type === 'CXC') {
      lastPayment = await this.prisma.customerPayment.findFirst({
        where: { companyId, receiptNumber: { startsWith: prefix } },
        orderBy: { receiptNumber: 'desc' }
      });
    } else {
      lastPayment = await this.prisma.supplierPayment.findFirst({
        where: { companyId, receiptNumber: { startsWith: prefix } },
        orderBy: { receiptNumber: 'desc' }
      });
    }

    let seq = 1;
    if (lastPayment && lastPayment.receiptNumber) {
      const lastSeq = parseInt(lastPayment.receiptNumber.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(6, '0')}`;
  }
}
