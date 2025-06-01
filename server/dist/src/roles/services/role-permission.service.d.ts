import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission } from '../schemas/permission.schema';
export declare class RolePermissionService {
    private roleModel;
    constructor(roleModel: Model<RoleDocument>);
    createRole(roleData: Partial<Role>): Promise<Role>;
    getAllRoles(): Promise<Role[]>;
    getRoleById(id: string): Promise<Role>;
    updateRole(id: string, roleData: Partial<Role>): Promise<Role>;
    addPermissionToRole(roleId: string, permission: Permission): Promise<Role>;
    removePermissionFromRole(roleId: string, permissionName: string): Promise<Role>;
    hasPermission(roleId: string, requiredPermission: string): Promise<boolean>;
    getRolePermissions(roleId: string): Promise<string[]>;
    updateRolePermissions(roleId: string, permissions: Permission[]): Promise<Role>;
    checkRole(roleId: string, requiredRole: string): Promise<boolean>;
}
