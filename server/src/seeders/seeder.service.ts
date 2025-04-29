import { Injectable } from '@nestjs/common';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly rolesSeeder: RolesSeeder,
    private readonly usersSeeder: UsersSeeder,
  ) {}

  async seed() {
    await this.rolesSeeder.seed();
    await this.usersSeeder.seed();
  }
} 