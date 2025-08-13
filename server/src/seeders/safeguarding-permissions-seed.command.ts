import { Command, CommandRunner } from 'nest-commander';
import { SafeguardingPermissionsSeeder } from './safeguarding-permissions.seeder';

@Command({
  name: 'seed:safeguarding-permissions',
  description: 'Seed safeguarding permissions and add them to admin role',
})
export class SafeguardingPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly safeguardingPermissionsSeeder: SafeguardingPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting safeguarding permissions seeding...');
    
    try {
      await this.safeguardingPermissionsSeeder.seed();
      console.log('Safeguarding permissions seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error seeding safeguarding permissions:', error);
      process.exit(1);
    }
  }
} 