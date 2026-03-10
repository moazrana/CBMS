import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

const SAFEGUARDING_ADVANCE_ACTIONS = [
  'approve',
  'reject',
  'export',
  'view_reports',
  'manage_settings',
  'assign',
] as const;

@Injectable()
export class DeleteSafeguardingAdvancePermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting deletion of safeguarding advance permissions...');

      const toDelete = await this.permissionModel
        .find({
          module: 'safeguarding',
          action: { $in: [...SAFEGUARDING_ADVANCE_ACTIONS] },
        })
        .exec();

      const count = toDelete.length;
      if (count === 0) {
        console.log('No safeguarding advance permissions found to delete.');
        return { deletedCount: 0, rolesUpdated: 0, message: 'No permissions to delete' };
      }

      const permissionNames = new Set(toDelete.map((p) => p.name));

      await this.permissionModel.deleteMany({
        _id: { $in: toDelete.map((p) => p._id) },
      });

      const roles = await this.roleModel.find().exec();
      let rolesUpdated = 0;
      for (const role of roles) {
        if (!role.permissions?.length) continue;
        const kept = role.permissions.filter(
          (p) => !permissionNames.has(p.name),
        );
        if (kept.length !== role.permissions.length) {
          await this.roleModel.updateOne(
            { _id: role._id },
            { $set: { permissions: kept } },
          );
          rolesUpdated++;
        }
      }

      console.log(`Deleted ${count} safeguarding advance permission(s).`);
      console.log(`Updated ${rolesUpdated} role(s) to remove these permissions.`);
      console.log('Safeguarding advance permissions deletion completed successfully.');

      return {
        deletedCount: count,
        rolesUpdated,
        message: `Deleted ${count} permission(s) and updated ${rolesUpdated} role(s).`,
      };
    } catch (error) {
      console.error('Error deleting safeguarding advance permissions:', error);
      throw error;
    }
  }
}
