import { IsString, IsOptional, IsArray, IsMongoId, IsEnum, IsNumber, Min, Max, IsDateString, IsBoolean } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  students?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  staffs?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  academicYear?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subject?: string;

  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Archived'])
  status?: string;
} 