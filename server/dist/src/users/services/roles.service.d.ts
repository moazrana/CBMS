import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Permission } from '../schemas/permission.schema';
export declare class RolesService {
    private roleModel;
    constructor(roleModel: Model<RoleDocument>);
    create(createRoleDto: CreateRoleDto): Promise<Role>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    findByName(name: string): Promise<Role>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
    remove(id: string): Promise<Role>;
    addPermissionToRole(roleId: string, permission: Permission): Promise<Role>;
    removePermissionFromRole(roleId: string, permissionId: string): Promise<Role>;
}
