import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentDocument = Student & Document;

// File/Note interface for notes and files
export interface StudentFile {
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: Date;
  notes?: string;
}

// Parent Address interface
export interface ParentAddress {
  apartment?: string;
  houseName?: string;
  houseNumber?: string;
  street?: string;
  townCity?: string;
  district?: string;
  county?: string;
  administrativeArea?: string;
  postTown?: string;
  postcode?: string;
}

// Parent interface
export interface Parent {
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  relationship?: string; // Mother/Father/Social Worker etc
  priority?: 'Primary' | 'Secondary' | 'Emergency';
  sex?: 'Male' | 'Female' | 'Unknown';
  email?: string;
  homePhone?: string;
  mobile?: string;
  workPhone?: string;
  alternateHomeNo?: string;
  parentalResponsibility?: boolean; // Y/N
  doNotContact?: boolean; // Y/N
  parentLivesWithStudent?: boolean; // Y/N
  estrangedParent?: boolean; // Y/N
  copyInLetters?: boolean; // Y/N
  address?: ParentAddress;
  notes?: string;
}

// Emergency Contact interface
export interface EmergencyContact {
  name?: string;
  relationship?: string;
  dayPhone?: string;
  eveningPhone?: string;
  mobile?: string;
  email?: string;
  address?: ParentAddress;
  notes?: string;
}

// Doctor Details interface
export interface DoctorDetails {
  name?: string;
  relationship?: string;
  mobile?: string;
  daytimePhone?: string;
  eveningPhone?: string;
  email?: string;
}

// EHCP interface
export interface EHCP {
  hasEHCP?: boolean; // Yes/No
  document?: StudentFile; // Document Upload
}

// Medical interface
export interface Medical {
  medicalDescription?: string;
  condition?: string;
  specialDiet?: string;
  medication?: string;
  medicationCode?: string;
  nhsNumber?: string;
  bloodGroup?: string;
  allergies?: string;
  impairments?: string;
  assistanceRequired?: boolean; // Y/N
  assistanceDescription?: string;
  medicalConditionCategory?: string;
  lastMedicalCheckDate?: Date;
  doctorDetails?: DoctorDetails;
  ehcp?: EHCP;
  senNotes?: string; // SEN notes
}

// Behaviour interface
export interface Behaviour {
  safeguardingConcern?: boolean; // Yes/No
  behaviourRiskLevel?: string;
  bodyMapPermission?: boolean; // Yes/No
  supportPlanDocument?: StudentFile; // Document Upload
  pastBehaviourNotes?: string;
}

// Personal Info interface
export interface PersonalInfo {
  legalFirstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  adno?: string; // Auto-generated Admission No.
  upn?: string; // Unique Pupil Number
  sex?: 'Male' | 'Female' | 'Unknown';
  dateOfBirth?: Date;
  email?: string;
  mobile?: string;
  admissionDate?: Date;
  yearGroup?: string;
  ethnicity?: string; // MIS requirement
  photo?: string; // Photo upload path/URL
  location?: string; // Location (Warrington or Burrow)
  notesAndFiles?: StudentFile[]; // Notes & Files (Add/Edit/Delete)
}

@Schema({ timestamps: true })
export class Student {
  @Prop({
    type: {
      legalFirstName: { type: String, required: true, trim: true },
      middleName: { type: String, trim: true },
      lastName: { type: String, required: true, trim: true },
      preferredName: { type: String, trim: true },
      adno: { type: String, unique: true, sparse: true, trim: true },
      upn: { type: String, unique: true, sparse: true, trim: true },
      sex: { type: String, enum: ['Male', 'Female', 'Unknown'] },
      dateOfBirth: { type: Date },
      email: { type: String, trim: true },
      mobile: { type: String, trim: true },
      admissionDate: { type: Date },
      yearGroup: { type: String, trim: true },
      ethnicity: { type: String, trim: true },
      photo: { type: String, trim: true },
      location: { type: String, trim: true },
      notesAndFiles: [{
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileType: { type: String },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
        notes: { type: String },
      }],
    },
    required: true,
    _id: false,
  })
  personalInfo: PersonalInfo;

  @Prop({
    type: [{
      salutation: { type: String, trim: true },
      firstName: { type: String, trim: true },
      middleName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      relationship: { type: String, trim: true },
      priority: { type: String, enum: ['Primary', 'Secondary', 'Emergency'] },
      sex: { type: String, enum: ['Male', 'Female', 'Unknown'] },
      email: { type: String, trim: true },
      homePhone: { type: String, trim: true },
      mobile: { type: String, trim: true },
      workPhone: { type: String, trim: true },
      alternateHomeNo: { type: String, trim: true },
      parentalResponsibility: { type: Boolean },
      doNotContact: { type: Boolean },
      parentLivesWithStudent: { type: Boolean },
      estrangedParent: { type: Boolean },
      copyInLetters: { type: Boolean },
      address: {
        apartment: { type: String, trim: true },
        houseName: { type: String, trim: true },
        houseNumber: { type: String, trim: true },
        street: { type: String, trim: true },
        townCity: { type: String, trim: true },
        district: { type: String, trim: true },
        county: { type: String, trim: true },
        administrativeArea: { type: String, trim: true },
        postTown: { type: String, trim: true },
        postcode: { type: String, trim: true },
      },
      notes: { type: String, trim: true },
    }],
    default: [],
  })
  parents?: Parent[];

  @Prop({
    type: [{
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      dayPhone: { type: String, trim: true },
      eveningPhone: { type: String, trim: true },
      mobile: { type: String, trim: true },
      email: { type: String, trim: true },
      address: {
        apartment: { type: String, trim: true },
        houseName: { type: String, trim: true },
        houseNumber: { type: String, trim: true },
        street: { type: String, trim: true },
        townCity: { type: String, trim: true },
        district: { type: String, trim: true },
        county: { type: String, trim: true },
        administrativeArea: { type: String, trim: true },
        postTown: { type: String, trim: true },
        postcode: { type: String, trim: true },
      },
      notes: { type: String, trim: true },
    }],
    default: [],
  })
  emergencyContacts?: EmergencyContact[];

  @Prop({
    type: {
      medicalDescription: { type: String, trim: true },
      condition: { type: String, trim: true },
      specialDiet: { type: String, trim: true },
      medication: { type: String, trim: true },
      medicationCode: { type: String, trim: true },
      nhsNumber: { type: String, trim: true },
      bloodGroup: { type: String, trim: true },
      allergies: { type: String, trim: true },
      impairments: { type: String, trim: true },
      assistanceRequired: { type: Boolean },
      assistanceDescription: { type: String, trim: true },
      medicalConditionCategory: { type: String, trim: true },
      lastMedicalCheckDate: { type: Date },
      doctorDetails: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        mobile: { type: String, trim: true },
        daytimePhone: { type: String, trim: true },
        eveningPhone: { type: String, trim: true },
        email: { type: String, trim: true },
      },
      ehcp: {
        hasEHCP: { type: Boolean },
        document: {
          fileName: { type: String, trim: true },
          filePath: { type: String, trim: true },
          fileType: { type: String, trim: true },
          fileSize: { type: Number },
          uploadedAt: { type: Date },
          notes: { type: String, trim: true },
        },
      },
      senNotes: { type: String, trim: true },
    },
    _id: false,
  })
  medical?: Medical;

  @Prop({
    type: {
      safeguardingConcern: { type: Boolean },
      behaviourRiskLevel: { type: String, trim: true },
      bodyMapPermission: { type: Boolean },
      supportPlanDocument: {
        fileName: { type: String, trim: true },
        filePath: { type: String, trim: true },
        fileType: { type: String, trim: true },
        fileSize: { type: Number },
        uploadedAt: { type: Date },
        notes: { type: String, trim: true },
      },
      pastBehaviourNotes: { type: String, trim: true },
    },
    _id: false,
  })
  behaviour?: Behaviour;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Indexes for better query performance
StudentSchema.index({ 'personalInfo.adno': 1 });
StudentSchema.index({ 'personalInfo.upn': 1 });
StudentSchema.index({ 'personalInfo.email': 1 });
StudentSchema.index({ 'personalInfo.lastName': 1, 'personalInfo.legalFirstName': 1 });
StudentSchema.index({ 'personalInfo.yearGroup': 1 });
StudentSchema.index({ 'personalInfo.admissionDate': 1 });
StudentSchema.index({ deletedAt: 1 });

