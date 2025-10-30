import { Command, CommandRunner } from 'nest-commander';
import { TimetablePermissionsSeeder } from './timetable-permissions.seeder';

@Command({
  name: 'seed:timetable-permissions',
  description: 'Seed timetable permissions and assign to admin role',
})
export class TimetablePermissionsSeedCommand extends CommandRunner {
  constructor(private readonly timetablePermissionsSeeder: TimetablePermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Timetable Permissions Seeding...');
    
    try {
      await this.timetablePermissionsSeeder.seed();
      console.log('✅ Timetable permissions seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding timetable permissions:', error);
      process.exit(1);
    }
    
    process.exit(0);
  }
}
