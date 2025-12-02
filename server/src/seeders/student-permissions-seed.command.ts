import { Command, CommandRunner } from 'nest-commander';
import { StudentPermissionsSeeder } from './student-permissions.seeder';

@Command({
  name: 'seed:student-permissions',
  description: 'Seed student permissions and assign to admin role',
})
export class StudentPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly studentPermissionsSeeder: StudentPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Student Permissions Seeding...');
    
    try {
      const result = await this.studentPermissionsSeeder.seed();
      
      if (result) {
        console.log('✅ Student permissions seeded successfully!');
      } else {
        console.log('❌ Failed to seed student permissions');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error seeding student permissions:', error);
      process.exit(1);
    }
    
    process.exit(0);
  }
}

