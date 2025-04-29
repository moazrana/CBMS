import { Model } from 'mongoose';
import { Permission } from '../permissions/schemas/permission.schema';
export declare class PermissionsSeeder {
    private permissionModel;
    constructor(permissionModel: Model<Permission>);
    seed(): Promise<void>;
}
