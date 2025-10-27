import { Command, CommandRunner } from 'nest-commander';
import { DeleteUsersSeeder } from './delete-users.seeder';

@Command({
  name: 'delete:users',
  description: 'Delete all users from the database',
})
export class DeleteUsersSeedCommand extends CommandRunner {
  constructor(private readonly deleteUsersSeeder: DeleteUsersSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting delete users command...');
      
      // Add confirmation prompt
      console.log('⚠️  WARNING: This will delete ALL users from the database!');
      console.log('⚠️  This action cannot be undone!');
      
      const result = await this.deleteUsersSeeder.seed();
      
      if (result) {
        console.log(`✨ Delete users command completed successfully!`);
        console.log(`📊 Deleted ${result.deletedCount} users`);
      }
    } catch (error) {
      console.error('💥 Error during delete users command:', error);
      process.exit(1);
    }
  }
}
