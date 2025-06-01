import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission } from '../../permissions/schemas/permission.schema';
export declare class RolesService {
    private roleModel;
    private permissionModel;
    constructor(roleModel: Model<RoleDocument>, permissionModel: Model<Permission>);
    create(role: any): Promise<boolean>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    findByName(name: string): Promise<Role>;
    update(id: string, updateRoleDto: any): Promise<Role>;
    remove(id: string): Promise<Role>;
}
