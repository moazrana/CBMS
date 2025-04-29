import { CreatePermissionDto } from './create-permission.dto';
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: CreatePermissionDto[];
    isDefault?: boolean;
}
