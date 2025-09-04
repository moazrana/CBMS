import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  permissions?: CreatePermissionDto[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 