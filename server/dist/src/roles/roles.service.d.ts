import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
interface CreateRoleDto {
    name: string;
    description?: string;
    permissions: string[];
}
export declare class RolesService {
    private roleModel;
    constructor(roleModel: Model<Role>);
    create(createRoleDto: CreateRoleDto): Promise<Role>;
    findAll(sort: string, order: string, search: string, page: number, perPage: number): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    update(id: string, updateRoleDto: {
        name?: string;
        description?: string;
    }): Promise<Role>;
    remove(id: string): Promise<Role>;
}
export {};
