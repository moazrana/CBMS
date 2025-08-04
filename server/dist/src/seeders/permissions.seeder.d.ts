import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
export declare class PermissionsSeeder {
    private permissionModel;
    constructor(permissionModel: Model<Permission>);
    seed(): Promise<boolean>;
}
