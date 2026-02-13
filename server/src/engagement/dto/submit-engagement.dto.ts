import { IsMongoId, IsDateString } from 'class-validator';

export class SubmitEngagementDto {
  @IsMongoId()
  classId: string;

  @IsMongoId()
  studentId: string;

  @IsDateString()
  engagementDate: string;
}
