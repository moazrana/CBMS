import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  module: string;

  @Prop({ required: true })
  action: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission); 