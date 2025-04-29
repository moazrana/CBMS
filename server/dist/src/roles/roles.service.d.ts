import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
export declare class RolesService {
    private roleModel;
    constructor(roleModel: Model<Role>);
    create(createRoleDto: {
        name: string;
        description?: string;
    }): Promise<Role>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    update(id: string, updateRoleDto: {
        name?: string;
        description?: string;
    }): Promise<Role>;
    remove(id: string): Promise<Role>;
}
