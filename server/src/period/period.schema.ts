import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Period extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  startTime: string; // e.g., '08:00'

  @Prop({ required: false })
  endTime: string; // e.g., '09:00'
}

export type PeriodDocument = Period & Document;
export const PeriodSchema = SchemaFactory.createForClass(Period); 