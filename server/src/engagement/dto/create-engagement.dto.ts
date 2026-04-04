import { IsMongoId, IsEnum, IsBoolean, IsString, IsOptional, IsDateString, IsIn, IsNumber, Min } from 'class-validator';
import { Session, Behaviour } from '../engagement.schema';

export class CreateEngagementDto {
  @IsMongoId()
  class: string;

  @IsEnum(Session)
  session: Session;

  @IsMongoId()
  student: string;

  @IsBoolean()
  attendance: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['authorized', 'unauthorized'])
  absenceType?: string;

  @IsEnum(Behaviour)
  behaviour: Behaviour;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  workUndertaken?: string;

  @IsDateString()
  engagementDate: string;

  @IsOptional()
  @IsBoolean()
  submitted?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateMinutes?: number;
}

