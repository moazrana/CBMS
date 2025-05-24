import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type DocumentDocument = UserDocument & MongooseDocument;

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum DocumentType {
  CERTIFICATE = 'certificate',
  DEGREE = 'degree',
  ID_PROOF = 'id_proof',
  OTHER = 'other'
}

@Schema({ timestamps: true })
export class UserDocument {
  _id: Types.ObjectId;

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
    enum: DocumentType,
    required: true 
  })
  documentType: DocumentType;

  @Prop({ 
    type: String, 
    enum: DocumentStatus, 
    default: DocumentStatus.PENDING 
  })
  status: DocumentStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId | User; // Allow both ObjectId and User

  @Prop()
  rejectionReason?: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(UserDocument);