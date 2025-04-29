import { Command, CommandRunner } from 'nest-commander';
import { PermissionsSeeder } from './permissions.seeder';

@Command({
  name: 'seed:permissions',
  description: 'Seed permissions in the database',
})
export class SeedPermissionsCommand extends CommandRunner {
  constructor(private readonly permissionsSeeder: PermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting permissions seeding...');
      const result = await this.permissionsSeeder.seed();
      
      if (result) {
        console.log('Permissions seeding completed successfully');
      } else {
        console.error('Permissions seeding failed');
      }
    } catch (error) {
      console.error('Error running permissions seeder:', error);
    }
  }
} 