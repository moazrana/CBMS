import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  students: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  staffs: MongooseSchema.Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  description: string;


  @Prop({ type: Date })
  academicYear: Date;

  @Prop({ type: [String], default: [] })
  subject: string;

  @Prop({ type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' })
  status: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

// Index for better query performance
ClassSchema.index({ name: 1 });
ClassSchema.index({ students: 1 });
ClassSchema.index({ staffs: 1 });
ClassSchema.index({ classTeacher: 1 });
ClassSchema.index({ status: 1 });
ClassSchema.index({ academicYear: 1 }); 