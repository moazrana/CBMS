import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { PermissionsSeeder } from './permissions.seeder';
export declare class SeederService {
    private readonly permissionsSeeder;
    private readonly rolesSeeder;
    private readonly usersSeeder;
    constructor(permissionsSeeder: PermissionsSeeder, rolesSeeder: RolesSeeder, usersSeeder: UsersSeeder);
    seed(): Promise<void>;
}
