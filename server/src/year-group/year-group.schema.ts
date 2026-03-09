import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class YearGroup extends Document {
  @Prop({ required: true, trim: true })
  name: string;
}

export type YearGroupDocument = YearGroup & Document;
export const YearGroupSchema = SchemaFactory.createForClass(YearGroup);

YearGroupSchema.index({ name: 1 }, { unique: true });
