import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class StaffPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting staff permissions seeding...');
      
      const staffPermissions = [
        {
          name: 'create_staff',
          description: 'Permission to create new staff members',
          module: 'staff',
          action: 'create',
        },
        {
          name: 'read_staff',
          description: 'Permission to view staff members',
          module: 'staff',
          action: 'read',
        },
        {
          name: 'update_staff',
          description: 'Permission to update staff members',
          module: 'staff',
          action: 'update',
        },
        {
          name: 'delete_staff',
          description: 'Permission to delete staff members',
          module: 'staff',
          action: 'delete',
        },
      ];

      const createdPermissions = [];

      // Create staff permissions
      for (const permissionData of staffPermissions) {
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

      // Update admin role with staff permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new staff permissions)
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
        
        console.log('Admin role updated with staff permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Staff permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding staff permissions:', error);
      return false;
    }
  }
}

