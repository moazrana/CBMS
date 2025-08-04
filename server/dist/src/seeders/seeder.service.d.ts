import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';
export declare class SeederService {
    private readonly permissionsSeeder;
    private readonly dashboardPermissionSeeder;
    private readonly rolePermissionsSeeder;
    private readonly rolesSeeder;
    private readonly usersSeeder;
    constructor(permissionsSeeder: PermissionsSeeder, dashboardPermissionSeeder: DashboardPermissionSeeder, rolePermissionsSeeder: RolePermissionsSeeder, rolesSeeder: RolesSeeder, usersSeeder: UsersSeeder);
    seed(): Promise<void>;
}
