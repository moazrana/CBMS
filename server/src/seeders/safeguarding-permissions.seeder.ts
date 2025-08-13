import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class SafeguardingPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting safeguarding permissions seeding...');
      
      const safeguardingPermissions = [
        {
          name: 'create_safeguarding',
          description: 'Permission to create new safeguarding incidents',
          module: 'safeguarding',
          action: 'create',
        },
        {
          name: 'read_safeguarding',
          description: 'Permission to view safeguarding incidents',
          module: 'safeguarding',
          action: 'read',
        },
        {
          name: 'update_safeguarding',
          description: 'Permission to update safeguarding incidents',
          module: 'safeguarding',
          action: 'update',
        },
        {
          name: 'delete_safeguarding',
          description: 'Permission to delete safeguarding incidents',
          module: 'safeguarding',
          action: 'delete',
        },
        {
          name: 'approve_safeguarding',
          description: 'Permission to approve safeguarding incidents',
          module: 'safeguarding',
          action: 'approve',
        },
        {
          name: 'reject_safeguarding',
          description: 'Permission to reject safeguarding incidents',
          module: 'safeguarding',
          action: 'reject',
        },
        {
          name: 'export_safeguarding',
          description: 'Permission to export safeguarding reports',
          module: 'safeguarding',
          action: 'export',
        },
        {
          name: 'view_safeguarding_reports',
          description: 'Permission to view safeguarding reports',
          module: 'safeguarding',
          action: 'view_reports',
        },
        {
          name: 'manage_safeguarding_settings',
          description: 'Permission to manage safeguarding settings',
          module: 'safeguarding',
          action: 'manage_settings',
        },
        {
          name: 'assign_safeguarding',
          description: 'Permission to assign safeguarding incidents to staff',
          module: 'safeguarding',
          action: 'assign',
        },
      ];

      const createdPermissions = [];

      // Create safeguarding permissions
      for (const permissionData of safeguardingPermissions) {
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

      // Update admin role with safeguarding permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new safeguarding permissions)
        await this.roleModel.findByIdAndUpdate(
          adminRole._id,
          { 
            permissions: allPermissions.map(p => ({
              name: p.name,
              description: p.description,
              module: p.module,
              action: p.action
            }))
          },
          { new: true }
        );
        
        console.log('Admin role updated with safeguarding permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Safeguarding permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding safeguarding permissions:', error);
      return false;
    }
  }
} 