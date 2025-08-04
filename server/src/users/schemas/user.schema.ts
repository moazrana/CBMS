import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from './role.schema';
import { UserDocument as UserDocumentType } from './document.schema';

export enum CertificateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

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
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User); 