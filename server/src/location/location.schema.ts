import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Location extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop({ type: [Number], default: undefined })
  coordinates: number[]; // [longitude, latitude]
}

export type LocationDocument = Location & Document;
export const LocationSchema = SchemaFactory.createForClass(Location); 