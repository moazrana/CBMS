import { Model } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';
export declare class RolesSeeder {
    private readonly roleModel;
    constructor(roleModel: Model<Role>);
    seed(): Promise<void>;
}
