import { RolesService } from './services/roles.service';
import { Role } from './schemas/role.schema';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(data: any): Promise<boolean>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    findByName(name: string): Promise<Role>;
    update(id: string, updateRoleDto: any): Promise<boolean>;
    remove(id: string): Promise<Role>;
}
