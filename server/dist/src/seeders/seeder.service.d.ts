import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';
import { SafeguardingPermissionsSeeder } from './safeguarding-permissions.seeder';
import { IncidentsPermissionsSeeder } from './incidents-permissions.seeder';
import { LocationSeeder } from './location.seeder';
import { PeriodSeeder } from './period.seeder';
import { StudentSeeder } from './student.seeder';
import { StaffSeeder } from './staff.seeder';
export declare class SeederService {
    private readonly permissionsSeeder;
    private readonly dashboardPermissionSeeder;
    private readonly rolePermissionsSeeder;
    private readonly safeguardingPermissionsSeeder;
    private readonly incidentsPermissionsSeeder;
    private readonly rolesSeeder;
    private readonly usersSeeder;
    private readonly locationSeeder;
    private readonly periodSeeder;
    private readonly studentSeeder;
    private readonly staffSeeder;
    constructor(permissionsSeeder: PermissionsSeeder, dashboardPermissionSeeder: DashboardPermissionSeeder, rolePermissionsSeeder: RolePermissionsSeeder, safeguardingPermissionsSeeder: SafeguardingPermissionsSeeder, incidentsPermissionsSeeder: IncidentsPermissionsSeeder, rolesSeeder: RolesSeeder, usersSeeder: UsersSeeder, locationSeeder: LocationSeeder, periodSeeder: PeriodSeeder, studentSeeder: StudentSeeder, staffSeeder: StaffSeeder);
    seed(): Promise<void>;
}
