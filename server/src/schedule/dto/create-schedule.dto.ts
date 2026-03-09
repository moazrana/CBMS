import { IsString, IsMongoId } from 'class-validator';

export class CreateScheduleDto {
  @IsMongoId()
  class: string;

  @IsString()
  day: string;

  @IsMongoId()
  period: string;

  @IsString()
  location: string;

  @IsMongoId()
  staff: string;

  @IsMongoId()
  teacher: string;
}
