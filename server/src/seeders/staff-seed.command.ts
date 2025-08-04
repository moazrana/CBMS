import { Command, CommandRunner } from 'nest-commander';
import { StaffSeeder } from './staff.seeder';

@Command({
  name: 'staff-seed',
  description: 'Seed the database with a staff user',
})
export class StaffSeedCommand extends CommandRunner {
  constructor(private readonly staffSeeder: StaffSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.staffSeeder.seed();
    } catch (error) {
      console.error('Error running staff seed command:', error);
      process.exit(1);
    }
  }
} 