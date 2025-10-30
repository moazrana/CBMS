import { IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  student: string;

  @IsDateString()
  date: string;

  @IsString()
  class: string;

  @IsString()
  period: string;

  @IsString()
  staff: string;

  @IsEnum(['attended', 'absent', 'late','none', 'authorized', 'on_report', 'sen', 'detentions', 'class_override'])
  session1?: string;

  @IsEnum(['attended', 'absent', 'late','none', 'authorized', 'on_report', 'sen', 'detentions', 'class_override'])
  session2?: string;

  @IsOptional()
  @IsNumber()
  lateMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

}
