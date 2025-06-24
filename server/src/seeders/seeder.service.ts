import { Injectable } from '@nestjs/common';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { PermissionsSeeder } from './permissions.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly permissionsSeeder: PermissionsSeeder,
    private readonly rolesSeeder: RolesSeeder,
    private readonly usersSeeder: UsersSeeder,
  ) {}

  async seed() {
    await this.permissionsSeeder.seed();
    await this.rolesSeeder.seed();
    await this.usersSeeder.seed();
  }
} 