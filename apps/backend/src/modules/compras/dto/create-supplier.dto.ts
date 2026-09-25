import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';
export class CreateSupplierDto {
  @IsString() legalName!: string;
  @IsString() @Matches(/^[JGVE]-\d{8}-\d$/) rif!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
}
