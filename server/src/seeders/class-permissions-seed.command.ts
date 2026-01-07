import { Command, CommandRunner } from 'nest-commander';
import { ClassPermissionsSeeder } from './class-permissions.seeder';

@Command({
  name: 'seed:class-permissions',
  description: 'Seed class permissions and assign to admin role',
})
export class ClassPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly classPermissionsSeeder: ClassPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Class Permissions Seeding...');
    
    try {
      const result = await this.classPermissionsSeeder.seed();
      
      if (result) {
        console.log('✅ Class permissions seeded successfully!');
      } else {
        console.log('❌ Failed to seed class permissions');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error seeding class permissions:', error);
      process.exit(1);
    }
    
    process.exit(0);
  }
}

