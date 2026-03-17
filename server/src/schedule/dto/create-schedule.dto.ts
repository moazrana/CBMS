import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsMongoId()
  class: string;

  @IsString()
  day: string;

  @IsMongoId()
  period: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsMongoId()
  staff?: string;

  @IsOptional()
  @IsMongoId()
  teacher?: string;
}
