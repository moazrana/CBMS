import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Role } from '../users/schemas/role.schema';
export declare class UsersSeeder {
    private userModel;
    private roleModel;
    constructor(userModel: Model<User>, roleModel: Model<Role>);
    seed(): Promise<void>;
}
