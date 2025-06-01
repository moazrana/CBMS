import { Permission } from '../../permissions/schemas/permission.schema';
export declare class CreateRoleDto {
    name: string;
    description?: string;
    permissions?: Permission[];
    isDefault?: boolean;
}
