import { Command, CommandRunner } from 'nest-commander';
import { DeleteIncidentsAdvancePermissionsSeeder } from './delete-incidents-advance-permissions.seeder';

@Command({
  name: 'delete:incidents-advance-permissions',
  description: 'Delete incident advance permissions (approve, reject, export, etc.) from the database',
})
export class DeleteIncidentsAdvancePermissionsSeedCommand extends CommandRunner {
  constructor(
    private readonly deleteIncidentsAdvancePermissionsSeeder: DeleteIncidentsAdvancePermissionsSeeder,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting delete incident advance permissions command...');
      const result = await this.deleteIncidentsAdvancePermissionsSeeder.seed();
      if (result && result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} permission(s), updated ${result.rolesUpdated} role(s).`);
      }
      process.exit(0);
    } catch (error) {
      console.error('Error during delete incident advance permissions command:', error);
      process.exit(1);
    }
  }
}
