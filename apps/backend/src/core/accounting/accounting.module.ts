import { Module, Global } from '@nestjs/common';
import { JournalAutomationService } from './journal-automation.service';
import { PrismaModule } from '../database/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [JournalAutomationService],
  exports: [JournalAutomationService],
})
export class AccountingModule {}
