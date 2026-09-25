import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
export class CreateEmployeeDto {
  @IsString() cedula!: string;
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsString() position!: string;
  @IsNumber() @Min(0) baseSalary!: number;
  @IsDateString() hireDate!: string;
  @IsOptional() @IsString() department?: string;
}
