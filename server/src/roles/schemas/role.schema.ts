import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from './permission.schema';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

export type RoleDocument = Role & Document;

@Schema()
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: Object }] })
  permissions: Permission[];

  @Prop({ default: false })
  isDefault?: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role); 