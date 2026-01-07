import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class ClassPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting class permissions seeding...');
      
      const classPermissions = [
        {
          name: 'create_class',
          description: 'Permission to create new classes',
          module: 'classes',
          action: 'create',
        },
        {
          name: 'read_class',
          description: 'Permission to view classes',
          module: 'classes',
          action: 'read',
        },
        {
          name: 'update_class',
          description: 'Permission to update classes',
          module: 'classes',
          action: 'update',
        },
        {
          name: 'delete_class',
          description: 'Permission to delete classes',
          module: 'classes',
          action: 'delete',
        },
      ];

      const createdPermissions = [];

      // Create class permissions
      for (const permissionData of classPermissions) {
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

      // Update admin role with class permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new class permissions)
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
        
        console.log('Admin role updated with class permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Class permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding class permissions:', error);
      return false;
    }
  }
}

