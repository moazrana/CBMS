import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditAction =
  | 'role_assignment'
  | 'create'
  | 'update'
  | 'delete'
  | 'incident_submission';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  action: AuditAction;

  @Prop({ required: true, trim: true })
  module: string;

  @Prop({ trim: true })
  recordId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  details?: Record<string, unknown>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type AuditLogDocument = AuditLog & Document;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
