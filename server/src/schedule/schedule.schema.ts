import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Schedule extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  class: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  day: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Period', required: true })
  period: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  staff?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  teacher?: MongooseSchema.Types.ObjectId;
}

export type ScheduleDocument = Schedule & Document;
export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ class: 1 });
ScheduleSchema.index({ class: 1, day: 1, period: 1 });
