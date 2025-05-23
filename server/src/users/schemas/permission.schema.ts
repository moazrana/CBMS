import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  _id: Types.ObjectId;
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  module: string; // e.g., 'users', 'products', 'orders'

  @Prop({ required: true })
  action: string; // e.g., 'create', 'read', 'update', 'delete'
}

export const PermissionSchema = SchemaFactory.createForClass(Permission); 