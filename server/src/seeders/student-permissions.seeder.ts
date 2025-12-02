import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class StudentPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting student permissions seeding...');
      
      const studentPermissions = [
        {
          name: 'create_student',
          description: 'Permission to create new students',
          module: 'students',
          action: 'create',
        },
        {
          name: 'read_student',
          description: 'Permission to view students',
          module: 'students',
          action: 'read',
        },
        {
          name: 'update_student',
          description: 'Permission to update students',
          module: 'students',
          action: 'update',
        },
        {
          name: 'delete_student',
          description: 'Permission to delete students',
          module: 'students',
          action: 'delete',
        },
      ];

      const createdPermissions = [];

      // Create student permissions
      for (const permissionData of studentPermissions) {
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

      // Update admin role with student permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new student permissions)
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
        
        console.log('Admin role updated with student permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Student permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding student permissions:', error);
      return false;
    }
  }
}

