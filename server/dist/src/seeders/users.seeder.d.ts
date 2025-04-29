import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Role } from '../roles/schemas/role.schema';
export declare class UsersSeeder {
    private readonly userModel;
    private readonly roleModel;
    constructor(userModel: Model<User>, roleModel: Model<Role>);
    seed(): Promise<void>;
}
