import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from './role.schema';
import { UserDocument as UserDocumentType } from './document.schema';

export enum CertificateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface StaffAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  daytimeTelephone?: string;
  eveningTelephone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface DBS {
  staffMember?: string;
  checkLevel?: string;
  applicationSentDate?: Date;
  applicationReferenceNumber?: string;
  certificateDateReceived?: Date;
  certificateNumber?: string;
  dbsSeenBy?: string;
  dbsCheckedDate?: Date;
  updateServiceId?: string;
  updateServiceCheckDate?: Date;
  rightToWork?: {
    type?: string;
    verifiedDate?: Date;
    verifiedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
    expiry?: Date;
    evidence?: string;
  };
  overseas?: {
    checkNeeded?: boolean;
    evidenceProduced?: boolean;
    checkDate?: Date;
    checkedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
    uploadEvidence?: string;
  };
  childrenBarredListCheck?: {
    completed?: boolean;
    checkDate?: Date;
    checkedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
  };
  prohibitionFromTeaching?: {
    checked?: boolean;
    checkDate?: Date;
    checkedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
  };
  prohibitionFromManagement?: {
    completed?: boolean;
    checkDate?: Date;
    checkedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
    notes?: string;
  };
  disqualificationUnderChildrenAct?: {
    completed?: boolean;
    checkDate?: Date;
    checkedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
  };
  disqualifiedByAssociation?: {
    completed?: boolean;
    checkedDate?: Date;
    checkedBy?: {
      _id: Types.ObjectId;
      name: string;
    };
  };
}

export interface TrainingRecord {
  courseName: string;
  dateCompleted?: Date;
  expiryDate?: Date;
  status?: string;
  notes?: string;
  uploadCertificate?: string;
}

export interface QualificationRecord {
  qualificationName: string;
  qualificationType?: string;
  classOfDegree?: string;
  achievedDate?: Date;
  expiryDate?: Date;
  subject1?: string;
  subject2?: string;
  qtStatus?: string;
  nqtEctStatus?: string;
  npqhQualification?: boolean;
  ccrsQualification?: boolean;
  notes?: string;
  uploadQualificationEvidence?: string;
}

export interface HRRecord {
  absenceType?: string;
  absenceDate?: Date;
  reason?: string;
  evidenceUpload?: string;
}

export interface DoctorContact {
  name?: string;
  relationship?: string;
  mobile?: string;
  daytimePhone?: string;
  eveningPhone?: string;
  email?: string;
}

export interface MedicalNeeds {
  medicalDescription?: string;
  conditionsSyndrome?: string;
  medication?: string;
  specialDiet?: string;
  impairments?: string;
  allergies?: string;
  assistanceRequired?: string;
  nhsNumber?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  lastMedicalCheck?: Date;
  doctorContactDetails?: DoctorContact[];
}

export interface StaffProfile {
  firstName: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  jobRole?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  phoneWork?: string;
  phoneMobile?: string;
  address?: StaffAddress;
}

export interface StudentProfile {
  // Will be defined when working on student profile
}

export interface AdminProfile {
  // Will be defined when working on admin profile
}

export type UserProfile = StaffProfile | StudentProfile | AdminProfile;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({required:true})
  pin:string;
  
  @Prop({ type: Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({required:false})
  subject:string;

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  enrolledClasses: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  teachingClasses: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  students: Types.ObjectId[];

  @Prop({
    type: {
      // Staff Profile fields
      firstName: { type: String },
      middleName: { type: String },
      lastName: { type: String },
      preferredName: { type: String },
      jobRole: { type: String },
      department: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      phoneWork: { type: String },
      phoneMobile: { type: String },
      address: {
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
      // Student Profile fields (to be added later)
      // Admin Profile fields (to be added later)
    },
    _id: false,
  })
  profile?: UserProfile;

  @Prop([{
    _id: Types.ObjectId,
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    status: {
      type: String,
      enum: Object.values(CertificateStatus),
      default: CertificateStatus.PENDING
    },
    expiry:String,
    approvedBy: {
      type: Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    uploadedAt: Date
  }])
  certificates: Array<{
    _id: Types.ObjectId;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    status: CertificateStatus;
    expiry?:string;
    approvedBy?: Types.ObjectId;
    rejectionReason?: string;
    uploadedAt: Date;
  }>;

  @Prop([{
    _id: Types.ObjectId,
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    documentType: String,
    status: String,
    approvedBy: {
      type: Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    uploadedAt: Date
  }])
  documents: UserDocumentType[];

  @Prop([{
    name: { type: String },
    relationship: { type: String },
    daytimeTelephone: { type: String },
    eveningTelephone: { type: String },
    mobile: { type: String },
    email: { type: String },
    address: { type: String },
    notes: { type: String },
  }])
  emergencyContacts?: EmergencyContact[];

  @Prop([{
    staffMember: { type: String },
    checkLevel: { type: String },
    applicationSentDate: { type: Date },
    applicationReferenceNumber: { type: String },
    certificateDateReceived: { type: Date },
    certificateNumber: { type: String },
    dbsSeenBy: { type: String },
    dbsCheckedDate: { type: Date },
    updateServiceId: { type: String },
    updateServiceCheckDate: { type: Date },
    rightToWork: {
      type: {
        type: { type: String },
        verifiedDate: { type: Date },
        verifiedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
        expiry: { type: Date },
        evidence: { type: String },
      },
      _id: false,
    },
    overseas: {
      type: {
        checkNeeded: { type: Boolean },
        evidenceProduced: { type: Boolean },
        checkDate: { type: Date },
        checkedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
        uploadEvidence: { type: String },
      },
      _id: false,
    },
    childrenBarredListCheck: {
      type: {
        completed: { type: Boolean },
        checkDate: { type: Date },
        checkedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
      },
      _id: false,
    },
    prohibitionFromTeaching: {
      type: {
        checked: { type: Boolean },
        checkDate: { type: Date },
        checkedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
      },
      _id: false,
    },
    prohibitionFromManagement: {
      type: {
        completed: { type: Boolean },
        checkDate: { type: Date },
        checkedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
        notes: { type: String },
      },
      _id: false,
    },
    disqualificationUnderChildrenAct: {
      type: {
        completed: { type: Boolean },
        checkDate: { type: Date },
        checkedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
      },
      _id: false,
    },
    disqualifiedByAssociation: {
      type: {
        completed: { type: Boolean },
        checkedDate: { type: Date },
        checkedBy: {
          type: {
            _id: { type: Types.ObjectId },
            name: { type: String },
          },
          _id: false,
        },
      },
      _id: false,
    },
  }])
  dbs?: DBS[];

  @Prop([
    {
      courseName: { type: String, required: true },
      dateCompleted: { type: Date },
      expiryDate: { type: Date },
      status: { type: String },
      notes: { type: String },
      uploadCertificate: { type: String },
    },
  ])
  cpdTraining?: TrainingRecord[];

  @Prop([
    {
      courseName: { type: String, required: true },
      dateCompleted: { type: Date },
      expiryDate: { type: Date },
      status: { type: String },
      notes: { type: String },
      uploadCertificate: { type: String },
    },
  ])
  
  qualifications?: QualificationRecord[];

  @Prop([
    {
      absenceType: { type: String },
      absenceDate: { type: Date },
      reason: { type: String },
      evidenceUpload: { type: String },
    },
  ])
  hr?: HRRecord[];

  @Prop({
    type: {
      medicalDescription: { type: String },
      conditionsSyndrome: { type: String },
      medication: { type: String },
      specialDiet: { type: String },
      impairments: { type: String },
      allergies: { type: String },
      assistanceRequired: { type: String },
      nhsNumber: { type: String },
      bloodGroup: { type: String },
      medicalNotes: { type: String },
      lastMedicalCheck: { type: Date },
      doctorContactDetails: [{
        name: { type: String },
        relationship: { type: String },
        mobile: { type: String },
        daytimePhone: { type: String },
        eveningPhone: { type: String },
        email: { type: String },
      }],
    },
    _id: false,
  })
  medicalNeeds?: MedicalNeeds;

}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User); 

// Add indexes for better query performance
UserSchema.index({ enrolledClasses: 1 });
UserSchema.index({ teachingClasses: 1 });
UserSchema.index({ students: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ email: 1 }); 