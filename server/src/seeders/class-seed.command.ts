import { Command, CommandRunner } from 'nest-commander';
import { ClassSeeder } from './class.seeder';

@Command({
  name: 'seed:classes',
  description: 'Seed the database with default classes',
})
export class ClassSeedCommand extends CommandRunner {
  constructor(private readonly classSeeder: ClassSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting class seeding process...');
      await this.classSeeder.seed();
      console.log('✨ Class seeding completed successfully!');
    } catch (error) {
      console.error('💥 Error during class seeding:', error);
      process.exit(1);
    }
  }
} 