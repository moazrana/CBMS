import { Injectable } from '@nestjs/common';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';
import { SafeguardingPermissionsSeeder } from './safeguarding-permissions.seeder';
import { IncidentsPermissionsSeeder } from './incidents-permissions.seeder';
import { AttendancePermissionsSeeder } from './attendance-permissions.seeder';
import { LocationSeeder } from './location.seeder';
import { PeriodSeeder } from './period.seeder';
import { StudentSeeder } from './student.seeder';
import { StaffSeeder } from './staff.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly permissionsSeeder: PermissionsSeeder,
    private readonly dashboardPermissionSeeder: DashboardPermissionSeeder,
    private readonly rolePermissionsSeeder: RolePermissionsSeeder,
    private readonly safeguardingPermissionsSeeder: SafeguardingPermissionsSeeder,
    private readonly incidentsPermissionsSeeder: IncidentsPermissionsSeeder,
    private readonly attendancePermissionsSeeder: AttendancePermissionsSeeder,
    private readonly rolesSeeder: RolesSeeder,
    private readonly usersSeeder: UsersSeeder,
    private readonly locationSeeder: LocationSeeder,
    private readonly periodSeeder: PeriodSeeder,
    private readonly studentSeeder: StudentSeeder,
    private readonly staffSeeder: StaffSeeder,
  ) {}

  async seed() {
    console.log('Starting all seeders...');
    
    // Run seeders in order
    await this.permissionsSeeder.seed();
    await this.dashboardPermissionSeeder.seed();
    await this.rolePermissionsSeeder.seed();
    await this.safeguardingPermissionsSeeder.seed();
    await this.incidentsPermissionsSeeder.seed();
    await this.attendancePermissionsSeeder.seed();
    await this.rolesSeeder.seed();
    await this.usersSeeder.seed();
    await this.locationSeeder.seed();
    await this.periodSeeder.seed();
    await this.studentSeeder.seed();
    await this.staffSeeder.seed();

    console.log('All seeders completed successfully!');
  }
} 