import { Command, CommandRunner } from 'nest-commander';
import { YearGroupSeeder } from './year-group.seeder';

@Command({
  name: 'seed:year-groups',
  description: 'Seed year groups (Year 1 to Year 10)',
})
export class YearGroupSeedCommand extends CommandRunner {
  constructor(private readonly yearGroupSeeder: YearGroupSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🚀 Seeding year groups (Year 1 – Year 10)...');

    try {
      await this.yearGroupSeeder.seed();
      console.log('✅ Year groups seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding year groups:', error);
      process.exit(1);
    }

    process.exit(0);
  }
}
