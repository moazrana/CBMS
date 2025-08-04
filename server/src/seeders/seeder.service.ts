import { Injectable } from '@nestjs/common';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly permissionsSeeder: PermissionsSeeder,
    private readonly dashboardPermissionSeeder: DashboardPermissionSeeder,
    private readonly rolePermissionsSeeder: RolePermissionsSeeder,
    private readonly rolesSeeder: RolesSeeder,
    private readonly usersSeeder: UsersSeeder,
  ) {}

  async seed() {
    console.log('Starting all seeders...');
    
    // Run seeders in order
    await this.permissionsSeeder.seed();
    await this.dashboardPermissionSeeder.seed();
    await this.rolePermissionsSeeder.seed();
    await this.rolesSeeder.seed();
    await this.usersSeeder.seed();
    
    console.log('All seeders completed successfully!');
  }
} 