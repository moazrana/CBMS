import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { Permission } from '../../permissions/schemas/permission.schema';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  permissions?: Permission[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 