import { Command, CommandRunner } from 'nest-commander';
import { IncidentsPermissionsSeeder } from './incidents-permissions.seeder';

@Command({
  name: 'seed:incidents-permissions',
  description: 'Seed incidents permissions and add them to admin role',
})
export class IncidentsPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly incidentsPermissionsSeeder: IncidentsPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting incidents permissions seeding...');
    
    try {
      await this.incidentsPermissionsSeeder.seed();
      console.log('Incidents permissions seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error seeding incidents permissions:', error);
      process.exit(1);
    }
  }
} 