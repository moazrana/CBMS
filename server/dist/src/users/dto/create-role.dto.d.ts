import { CreatePermissionDto } from '../dto/create-permission.dto';
export declare class CreateRoleDto {
    name: string;
    description: string;
    permissions?: CreatePermissionDto[];
    isDefault?: boolean;
}
