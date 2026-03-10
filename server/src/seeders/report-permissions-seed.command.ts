import { Command, CommandRunner } from 'nest-commander';
import { ReportPermissionsSeeder } from './report-permissions.seeder';

@Command({
  name: 'seed:report-permissions',
  description: 'Seed report permissions and assign to admin role',
})
export class ReportPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly reportPermissionsSeeder: ReportPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Report Permissions Seeding...');

    try {
      const result = await this.reportPermissionsSeeder.seed();

      if (result) {
        console.log('✅ Report permissions seeded successfully!');
      } else {
        console.log('❌ Failed to seed report permissions');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error seeding report permissions:', error);
      process.exit(1);
    }

    process.exit(0);
  }
}
