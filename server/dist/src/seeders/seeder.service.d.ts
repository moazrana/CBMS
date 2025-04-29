import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
export declare class SeederService {
    private readonly rolesSeeder;
    private readonly usersSeeder;
    constructor(rolesSeeder: RolesSeeder, usersSeeder: UsersSeeder);
    seed(): Promise<void>;
}
