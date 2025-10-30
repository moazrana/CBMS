import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Class } from '../../class/class.schema';
import { Period } from '../../period/period.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  class: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Period', required: true })
  period: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  staff: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ['attended', 'absent', 'late','none', 'authorized', 'on_report', 'sen', 'detentions', 'class_override'],
    default: 'attended'
  })
  session1: string;

  @Prop({
    type: String,
    enum: ['attended', 'absent', 'late','none', 'authorized', 'on_report', 'sen', 'detentions', 'class_override'],
    default: 'attended'
  })
  session2: string;

  @Prop({ type: Number, default: 0 })
  lateMinutes: number;

  @Prop({ type: String, trim: true })
  notes: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ student: 1, date: 1 });
AttendanceSchema.index({ class: 1, date: 1 });
AttendanceSchema.index({ staff: 1, date: 1 });
AttendanceSchema.index({ period: 1, date: 1,staff:1,class:1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });
