import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: {
        name: string;
        description?: string;
    }): Promise<import("./schemas/role.schema").Role>;
    findAll(): Promise<import("./schemas/role.schema").Role[]>;
    findOne(id: string): Promise<import("./schemas/role.schema").Role>;
    update(id: string, updateRoleDto: {
        name?: string;
        description?: string;
    }): Promise<import("./schemas/role.schema").Role>;
    remove(id: string): Promise<import("./schemas/role.schema").Role>;
}
