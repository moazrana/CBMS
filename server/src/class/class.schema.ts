import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ type: Date, required: true })
  fromDate: Date;

  @Prop({ type: Date, required: true })
  toDate: Date;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  yeargroup: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Student', default: [] })
  students: MongooseSchema.Types.ObjectId[];

  @Prop({ type: String, trim: true })
  notes?: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

// Index for better query performance
ClassSchema.index({ location: 1 });
ClassSchema.index({ fromDate: 1 });
ClassSchema.index({ toDate: 1 });
ClassSchema.index({ subject: 1 });
ClassSchema.index({ yeargroup: 1 });
ClassSchema.index({ students: 1 });