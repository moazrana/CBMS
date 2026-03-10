import { Command, CommandRunner } from 'nest-commander';
import { DeleteSafeguardingAdvancePermissionsSeeder } from './delete-safeguarding-advance-permissions.seeder';

@Command({
  name: 'delete:safeguarding-advance-permissions',
  description: 'Delete safeguarding advance permissions (approve, reject, export, etc.) from the database',
})
export class DeleteSafeguardingAdvancePermissionsSeedCommand extends CommandRunner {
  constructor(
    private readonly deleteSafeguardingAdvancePermissionsSeeder: DeleteSafeguardingAdvancePermissionsSeeder,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting delete safeguarding advance permissions command...');
      const result = await this.deleteSafeguardingAdvancePermissionsSeeder.seed();
      if (result && result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} permission(s), updated ${result.rolesUpdated} role(s).`);
      }
      process.exit(0);
    } catch (error) {
      console.error('Error during delete safeguarding advance permissions command:', error);
      process.exit(1);
    }
  }
}
