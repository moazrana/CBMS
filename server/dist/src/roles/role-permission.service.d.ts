import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
import { Permission } from '../permissions/schemas/permission.schema';
export declare class RolePermissionService {
    private roleModel;
    private permissionModel;
    constructor(roleModel: Model<Role>, permissionModel: Model<Permission>);
    getRolePermissions(roleId: string): Promise<string[]>;
    hasPermission(roleId: string, requiredPermission: string): Promise<boolean>;
}
