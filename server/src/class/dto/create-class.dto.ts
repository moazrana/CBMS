import { IsString, IsOptional, IsArray, IsMongoId, IsDateString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  location: string;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  subject: string;

  @IsString()
  yeargroup: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  students?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
} 