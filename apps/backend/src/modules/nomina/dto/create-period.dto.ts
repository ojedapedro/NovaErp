import { IsString, IsDateString } from 'class-validator';
export class CreatePeriodDto {
  @IsString() periodName!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
}
