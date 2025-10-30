import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../users/schemas/permission.schema';
import { Role, RoleDocument } from '../users/schemas/role.schema';

@Injectable()
export class TimetablePermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting Timetable Permissions Seeding...');

    const timetablePermissions = [
      {
        name: 'view_time_table',
        description: 'View timetable information',
        module: 'timetable',
        action: 'read',
      },
      {
        name: 'time_table_allocation',
        description: 'Allocate and manage timetable',
        module: 'timetable',
        action: 'write',
      }
    ];

    const createdPermissions = [];

    for (const permissionData of timetablePermissions) {
      try {
        const existingPermission = await this.permissionModel.findOne({
          name: permissionData.name
        });

        if (existingPermission) {
          console.log(`✅ Permission '${permissionData.name}' already exists, skipping...`);
          createdPermissions.push(existingPermission);
          continue;
        }

        const permission = new this.permissionModel(permissionData);
        await permission.save();
        console.log(`✅ Created permission: ${permissionData.name}`);
        createdPermissions.push(permission);
      } catch (error) {
        console.error(`❌ Error creating permission '${permissionData.name}':`, error);
      }
    }

    // Assign permissions to admin role
    await this.assignPermissionsToAdmin(createdPermissions);

    console.log('🎉 Timetable Permissions Seeding completed!');
  }

  private async assignPermissionsToAdmin(permissions: Permission[]): Promise<void> {
    try {
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (!adminRole) {
        console.log('⚠️  Admin role not found, skipping permission assignment...');
        return;
      }

      // Get all existing permissions for admin role
      const allPermissions = await this.permissionModel.find().exec();
      
      // Update admin role with all permissions (including new timetable permissions)
      await this.roleModel.findByIdAndUpdate(
        adminRole._id,
        { 
          permissions: allPermissions.map(p => ({
            name: p.name,
            description: p.description,
            module: p.module,
            action: p.action,
          }))
        },
        { new: true }
      );
      
      console.log('✅ Updated admin role with all permissions including timetable permissions');
    } catch (error) {
      console.error('❌ Error assigning permissions to admin role:', error);
    }
  }

  async clear(): Promise<void> {
    console.log('🧹 Clearing Timetable Permissions...');
    
    const timetablePermissionNames = ['view_time_table', 'time_table_allocation'];
    
    for (const permissionName of timetablePermissionNames) {
      try {
        const result = await this.permissionModel.deleteOne({ name: permissionName });
        if (result.deletedCount > 0) {
          console.log(`✅ Deleted permission: ${permissionName}`);
        } else {
          console.log(`ℹ️  Permission '${permissionName}' not found, skipping...`);
        }
      } catch (error) {
        console.error(`❌ Error deleting permission '${permissionName}':`, error);
      }
    }

    console.log('🎉 Timetable Permissions clearing completed!');
  }
}
