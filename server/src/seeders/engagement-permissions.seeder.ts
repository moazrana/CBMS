import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class EngagementPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting engagement permissions seeding...');

      const engagementPermissions = [
        {
          name: 'create_engagement',
          description: 'Permission to create and submit engagement records',
          module: 'engagement',
          action: 'create',
        },
        {
          name: 'read_engagement',
          description: 'Permission to view engagement records',
          module: 'engagement',
          action: 'read',
        },
        {
          name: 'read_marked_engagement',
          description: 'Permission to view marked engagements',
          module: 'engagement',
          action: 'read_marked',
        },
        {
          name: 'update_engagement',
          description: 'Permission to update engagement records',
          module: 'engagement',
          action: 'update',
        },
        {
          name: 'delete_engagement',
          description: 'Permission to delete engagement records',
          module: 'engagement',
          action: 'delete',
        },
      ];

      const createdPermissions: Permission[] = [];

      // Create engagement permissions
      for (const permissionData of engagementPermissions) {
        const existingPermission = await this.permissionModel.findOne({
          name: permissionData.name,
          module: permissionData.module,
          action: permissionData.action,
        });

        if (!existingPermission) {
          const permission = new this.permissionModel(permissionData);
          await permission.save();
          createdPermissions.push(permission);
          console.log(`${permissionData.name} permission created successfully`);
        } else {
          createdPermissions.push(existingPermission);
          console.log(`${permissionData.name} permission already exists`);
        }
      }

      // Update admin role with engagement permissions (actually with all permissions)
      const adminRole = await this.roleModel.findOne({ name: 'admin' });

      if (adminRole) {
        const allPermissions = await this.permissionModel.find().exec();

        await this.roleModel.findByIdAndUpdate(
          adminRole._id,
          {
            permissions: allPermissions.map((p) => ({
              name: p.name,
              description: p.description,
              module: p.module,
              action: p.action,
            })),
          },
          { new: true },
        );

        console.log('Admin role updated with engagement permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Engagement permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding engagement permissions:', error);
      return false;
    }
  }
}

