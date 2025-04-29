import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../schemas/role.schema';
import { Permission } from '../schemas/permission.schema';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async seed() {
    try {
      console.log('Starting roles seeding...');
      
      // Get all permissions
      const allPermissions = await this.permissionModel.find().exec();
      
      if (allPermissions.length === 0) {
        console.log('No permissions found. Please run the permissions seeder first.');
        return;
      }
      
      // Check if admin role already exists
      const existingAdminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (existingAdminRole) {
        console.log('Admin role already exists. Updating permissions...');
        
        // Update admin role with all permissions
        await this.roleModel.findByIdAndUpdate(
          existingAdminRole._id,
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
        
        console.log('Admin role updated with all permissions');
      } else {
        // Create admin role with all permissions
        const adminRole = new this.roleModel({
          name: 'admin',
          description: 'Administrator role with full access',
          permissions: allPermissions.map(p => ({
            name: p.name,
            description: p.description,
            module: p.module,
            action: p.action
          })),
          isDefault: false
        });
        
        await adminRole.save();
        console.log('Admin role created with all permissions');
      }
      
      // Create user role if it doesn't exist
      const existingUserRole = await this.roleModel.findOne({ name: 'user' });
      
      if (!existingUserRole) {
        // Create user role with limited permissions
        const userRole = new this.roleModel({
          name: 'user',
          description: 'Regular user role',
          permissions: [
            {
              name: 'user_read',
              description: 'Read user information',
              module: 'users',
              action: 'read'
            }
          ],
          isDefault: true
        });
        
        await userRole.save();
        console.log('User role created with limited permissions');
      }
      
      console.log('Roles seeding completed successfully');
    } catch (error) {
      console.error('Error seeding roles:', error);
      throw error;
    }
  }
} 