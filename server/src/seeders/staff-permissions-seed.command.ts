import { Command, CommandRunner } from 'nest-commander';
import { StaffPermissionsSeeder } from './staff-permissions.seeder';

@Command({
  name: 'seed:staff-permissions',
  description: 'Seed staff permissions and assign to admin role',
})
export class StaffPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly staffPermissionsSeeder: StaffPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Staff Permissions Seeding...');
    
    try {
      const result = await this.staffPermissionsSeeder.seed();
      
      if (result) {
        console.log('✅ Staff permissions seeded successfully!');
      } else {
        console.log('❌ Failed to seed staff permissions');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error seeding staff permissions:', error);
      process.exit(1);
    }
    
    process.exit(0);
  }
}

