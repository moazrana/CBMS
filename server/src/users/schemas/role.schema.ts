import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission, PermissionSchema } from './permission.schema';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager'
}

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [PermissionSchema], default: [] })
  permissions: Permission[];

  @Prop({ default: false })
  isDefault: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role); 