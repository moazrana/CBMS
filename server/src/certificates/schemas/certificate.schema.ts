import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CertificateDocument = Certificate & Document;

export enum CertificateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Schema({ timestamps: true })
export class Certificate {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher: User;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ 
    type: String, 
    enum: CertificateStatus, 
    default: CertificateStatus.PENDING 
  })
  status: CertificateStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: User;

  @Prop()
  rejectionReason?: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate); 