import { Command, CommandRunner } from 'nest-commander';
import { EngagementPermissionsSeeder } from './engagement-permissions.seeder';

@Command({
  name: 'seed:engagement-permissions',
  description: 'Seed engagement permissions and assign to admin role',
})
export class EngagementPermissionsSeedCommand extends CommandRunner {
  constructor(private readonly engagementPermissionsSeeder: EngagementPermissionsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Engagement Permissions Seeding...');

    try {
      const result = await this.engagementPermissionsSeeder.seed();

      if (result) {
        console.log('✅ Engagement permissions seeded successfully!');
      } else {
        console.log('❌ Failed to seed engagement permissions');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error seeding engagement permissions:', error);
      process.exit(1);
    }

    process.exit(0);
  }
}

