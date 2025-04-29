import { CommandRunner } from 'nest-commander';
import { PermissionsSeeder } from './permissions.seeder';
export declare class SeedPermissionsCommand extends CommandRunner {
    private readonly permissionsSeeder;
    constructor(permissionsSeeder: PermissionsSeeder);
    run(): Promise<void>;
}
