import { Model } from 'mongoose';
import { Role } from '../users/schemas/role.schema';
import { Permission } from '../users/schemas/permission.schema';
export declare class RolesSeeder {
    private roleModel;
    private permissionModel;
    constructor(roleModel: Model<Role>, permissionModel: Model<Permission>);
    seed(): Promise<void>;
}
