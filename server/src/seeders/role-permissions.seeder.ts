import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class RolePermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting role permissions seeding...');
      
      const rolePermissions = [
        {
          name: 'create_role',
          description: 'Permission to create new roles',
          module: 'roles',
          action: 'create',
        },
        {
          name: 'read_role',
          description: 'Permission to view roles',
          module: 'roles',
          action: 'read',
        },
        {
          name: 'update_role',
          description: 'Permission to update roles',
          module: 'roles',
          action: 'update',
        },
        {
          name: 'delete_role',
          description: 'Permission to delete roles',
          module: 'roles',
          action: 'delete',
        },
      ];

      const createdPermissions = [];

      // Create role permissions
      for (const permissionData of rolePermissions) {
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

      // Update admin role with new role permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new role permissions)
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
        
        console.log('Admin role updated with role CRUD permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Role permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding role permissions:', error);
      return false;
    }
  }
} 