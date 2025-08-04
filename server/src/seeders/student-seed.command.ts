import { Command, CommandRunner } from 'nest-commander';
import { StudentSeeder } from './student.seeder';

@Command({
  name: 'student-seed',
  description: 'Seed the database with a student user',
})
export class StudentSeedCommand extends CommandRunner {
  constructor(private readonly studentSeeder: StudentSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.studentSeeder.seed();
    } catch (error) {
      console.error('Error running student seed command:', error);
      process.exit(1);
    }
  }
} 