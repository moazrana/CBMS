import { IsMongoId, IsEnum, IsBoolean, IsString, IsOptional, IsDateString } from 'class-validator';
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

  @IsEnum(Behaviour)
  behaviour: Behaviour;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsDateString()
  engagementDate: string;
}

