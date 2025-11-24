import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
  IsArray,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class OverseasDto {
  @IsOptional()
  @IsBoolean()
  checkNeeded?: boolean;

  @IsOptional()
  @IsBoolean()
  evidenceProduced?: boolean;

  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @IsOptional()
  @IsMongoId()
  checkedByUserId?: string;

  @IsOptional()
  @IsString()
  uploadEvidence?: string;
}

class ChildrenBarredListDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @IsOptional()
  @IsMongoId()
  checkedByUserId?: string;
}

class ProhibitionFromTeachingDto {
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @IsOptional()
  @IsMongoId()
  checkedByUserId?: string;
}

class ProhibitionFromManagementDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @IsOptional()
  @IsMongoId()
  checkedByUserId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class DisqualificationUnderChildrenActDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @IsOptional()
  @IsMongoId()
  checkedByUserId?: string;
}

class DisqualifiedByAssociationDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  checkedDate?: string;

  @IsOptional()
  @IsMongoId()
  checkedByUserId?: string;
}

class TrainingRecordDto {
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsOptional()
  @IsDateString()
  dateCompleted?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  uploadCertificate?: string;
}

class QualificationDto {
  @IsString()
  @IsNotEmpty()
  qualificationName: string;

  @IsOptional()
  @IsString()
  qualificationType?: string;

  @IsOptional()
  @IsString()
  classOfDegree?: string;

  @IsOptional()
  @IsDateString()
  achievedDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  subject1?: string;

  @IsOptional()
  @IsString()
  subject2?: string;

  @IsOptional()
  @IsString()
  qtStatus?: string;

  @IsOptional()
  @IsString()
  nqtEctStatus?: string;

  @IsOptional()
  @IsBoolean()
  npqhQualification?: boolean;

  @IsOptional()
  @IsBoolean()
  ccrsQualification?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  uploadQualificationEvidence?: string;
}

class HRRecordDto {
  @IsOptional()
  @IsString()
  absenceType?: string;

  @IsOptional()
  @IsDateString()
  absenceDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  evidenceUpload?: string;
}

class DoctorContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  daytimePhone?: string;

  @IsOptional()
  @IsString()
  eveningPhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

class MedicalNeedsDto {
  @IsOptional()
  @IsString()
  medicalDescription?: string;

  @IsOptional()
  @IsString()
  conditionsSyndrome?: string;

  @IsOptional()
  @IsString()
  medication?: string;

  @IsOptional()
  @IsString()
  specialDiet?: string;

  @IsOptional()
  @IsString()
  impairments?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  assistanceRequired?: string;

  @IsOptional()
  @IsString()
  nhsNumber?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @IsOptional()
  @IsDateString()
  lastMedicalCheck?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DoctorContactDto)
  doctorContactDetails?: DoctorContactDto[];
}

class RightToWorkDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  verifiedDate?: string;

  @IsOptional()
  @IsMongoId()
  verifiedByUserId?: string;

  @IsOptional()
  @IsDateString()
  expiry?: string;

  @IsOptional()
  @IsString()
  evidence?: string;
}

class DBSDto {
  @IsOptional()
  @IsString()
  staffMember?: string;

  @IsOptional()
  @IsString()
  checkLevel?: string;

  @IsOptional()
  @IsDateString()
  applicationSentDate?: string;

  @IsOptional()
  @IsString()
  applicationReferenceNumber?: string;

  @IsOptional()
  @IsDateString()
  certificateDateReceived?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  dbsSeenBy?: string;

  @IsOptional()
  @IsDateString()
  dbsCheckedDate?: string;

  @IsOptional()
  @IsString()
  updateServiceId?: string;

  @IsOptional()
  @IsDateString()
  updateServiceCheckDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RightToWorkDto)
  rightToWork?: RightToWorkDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OverseasDto)
  overseas?: OverseasDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChildrenBarredListDto)
  childrenBarredListCheck?: ChildrenBarredListDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProhibitionFromTeachingDto)
  prohibitionFromTeaching?: ProhibitionFromTeachingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProhibitionFromManagementDto)
  prohibitionFromManagement?: ProhibitionFromManagementDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DisqualificationUnderChildrenActDto)
  disqualificationUnderChildrenAct?: DisqualificationUnderChildrenActDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DisqualifiedByAssociationDto)
  disqualifiedByAssociation?: DisqualifiedByAssociationDto;
}

class StaffAddressDto {
  @IsOptional()
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  preferredName?: string;

  @IsOptional()
  @IsString()
  jobRole?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phoneWork?: string;

  @IsOptional()
  @IsString()
  phoneMobile?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffAddressDto)
  address?: StaffAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DBSDto)
  dbs?: DBSDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingRecordDto)
  cpdTraining?: TrainingRecordDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingRecordDto)
  safeguardingTraining?: TrainingRecordDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications?: QualificationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HRRecordDto)
  hr?: HRRecordDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalNeedsDto)
  medicalNeeds?: MedicalNeedsDto;
}

class EmergencyContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  daytimeTelephone?: string;

  @IsOptional()
  @IsString()
  eveningTelephone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

