import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Role } from '../schemas/role.schema';
export declare class UsersSeeder {
    private userModel;
    private roleModel;
    constructor(userModel: Model<User>, roleModel: Model<Role>);
    seed(): Promise<void>;
}
