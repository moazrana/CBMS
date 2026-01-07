import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentFileDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ParentAddressDto {
  @IsOptional()
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsString()
  houseName?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  townCity?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  administrativeArea?: string;

  @IsOptional()
  @IsString()
  postTown?: string;

  @IsOptional()
  @IsString()
  postcode?: string;
}

export class ParentDto {
  @IsOptional()
  @IsString()
  salutation?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  relationship?: string; // Mother/Father/Social Worker etc

  @IsOptional()
  @IsEnum(['Primary', 'Secondary', 'Emergency'])
  priority?: 'Primary' | 'Secondary' | 'Emergency';

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Unknown'])
  sex?: 'Male' | 'Female' | 'Unknown';

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  homePhone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsString()
  alternateHomeNo?: string;

  @IsOptional()
  @IsBoolean()
  parentalResponsibility?: boolean; // Y/N

  @IsOptional()
  @IsBoolean()
  doNotContact?: boolean; // Y/N

  @IsOptional()
  @IsBoolean()
  parentLivesWithStudent?: boolean; // Y/N

  @IsOptional()
  @IsBoolean()
  estrangedParent?: boolean; // Y/N

  @IsOptional()
  @IsBoolean()
  copyInLetters?: boolean; // Y/N

  @IsOptional()
  @ValidateNested()
  @Type(() => ParentAddressDto)
  address?: ParentAddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PersonalInfoDto {
  @IsString()
  @IsNotEmpty()
  legalFirstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  preferredName?: string;

  @IsOptional()
  @IsString()
  adno?: string; // Auto-generated, but can be provided

  @IsOptional()
  @IsString()
  upn?: string; // Unique Pupil Number with lookup

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Unknown'])
  sex?: 'Male' | 'Female' | 'Unknown';

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @IsOptional()
  @IsString()
  yearGroup?: string;

  @IsOptional()
  @IsString()
  ethnicity?: string; // MIS requirement

  @IsOptional()
  @IsString()
  photo?: string; // Photo upload path/URL

  @IsOptional()
  @IsString()
  location?: string; // Location (Warrington or Burrow)

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentFileDto)
  notesAndFiles?: StudentFileDto[];
}

export class EmergencyContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  dayPhone?: string;

  @IsOptional()
  @IsString()
  eveningPhone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ParentAddressDto)
  address?: ParentAddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DoctorDetailsDto {
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

export class EHCPDto {
  @IsOptional()
  @IsBoolean()
  hasEHCP?: boolean; // Yes/No

  @IsOptional()
  @ValidateNested()
  @Type(() => StudentFileDto)
  document?: StudentFileDto; // Document Upload
}

export class MedicalDto {
  @IsOptional()
  @IsString()
  medicalDescription?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  specialDiet?: string;

  @IsOptional()
  @IsString()
  medication?: string;

  @IsOptional()
  @IsString()
  medicationCode?: string;

  @IsOptional()
  @IsString()
  nhsNumber?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  impairments?: string;

  @IsOptional()
  @IsBoolean()
  assistanceRequired?: boolean; // Y/N

  @IsOptional()
  @IsString()
  assistanceDescription?: string;

  @IsOptional()
  @IsString()
  medicalConditionCategory?: string;

  @IsOptional()
  @IsDateString()
  lastMedicalCheckDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DoctorDetailsDto)
  doctorDetails?: DoctorDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EHCPDto)
  ehcp?: EHCPDto;

  @IsOptional()
  @IsString()
  senNotes?: string; // SEN notes
}

export class BehaviourDto {
  @IsOptional()
  @IsBoolean()
  safeguardingConcern?: boolean; // Yes/No

  @IsOptional()
  @IsString()
  behaviourRiskLevel?: string;

  @IsOptional()
  @IsBoolean()
  bodyMapPermission?: boolean; // Yes/No

  @IsOptional()
  @ValidateNested()
  @Type(() => StudentFileDto)
  supportPlanDocument?: StudentFileDto; // Document Upload

  @IsOptional()
  @IsString()
  pastBehaviourNotes?: string;
}

export class CreateStudentDto {
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParentDto)
  parents?: ParentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalDto)
  medical?: MedicalDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BehaviourDto)
  behaviour?: BehaviourDto;
}

