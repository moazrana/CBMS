import { Command, CommandRunner } from 'nest-commander';
import { AttendancePermissionsSeeder } from './attendance-permissions.seeder';

@Command({
  name: 'seed:attendance-permissions',
  description: 'Seed attendance permissions and add them to admin role',
})
export class AttendancePermissionsSeedCommand extends CommandRunner {
  constructor(private readonly attendancePermissionsSeeder: AttendancePermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting attendance permissions seeding...');
    
    try {
      const result = await this.attendancePermissionsSeeder.seed();
      
      if (result) {
        console.log('✅ Attendance permissions seeded successfully!');
      } else {
        console.log('❌ Failed to seed attendance permissions');
      }
    } catch (error) {
      console.error('❌ Error seeding attendance permissions:', error);
    }
    
    process.exit(0);
  }
} 