import { Model } from 'mongoose';
import { Role } from '../schemas/role.schema';
import { Permission } from '../schemas/permission.schema';
export declare class RolesSeeder {
    private roleModel;
    private permissionModel;
    constructor(roleModel: Model<Role>, permissionModel: Model<Permission>);
    seed(): Promise<void>;
}
