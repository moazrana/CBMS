import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { CreatePermissionDto } from '../dto/create-permission.dto';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  permissions?: CreatePermissionDto[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 