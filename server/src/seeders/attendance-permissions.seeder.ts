import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class AttendancePermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting attendance permissions seeding...');
      
      const attendancePermissions = [
        {
          name: 'view_attendance',
          description: 'Permission to view attendance records',
          module: 'attendance',
          action: 'view',
        },
        {
          name: 'create_attendance',
          description: 'Permission to create attendance records',
          module: 'attendance',
          action: 'create',
        },
        {
          name: 'update_attendance',
          description: 'Permission to update attendance records',
          module: 'attendance',
          action: 'update',
        },
        {
          name: 'delete_attendance',
          description: 'Permission to delete attendance records',
          module: 'attendance',
          action: 'delete',
        },
        {
          name: 'mark_attendance',
          description: 'Permission to mark student attendance',
          module: 'attendance',
          action: 'mark',
        },
        {
          name: 'view_attendance_reports',
          description: 'Permission to view attendance reports',
          module: 'attendance',
          action: 'view_reports',
        },
        {
          name: 'export_attendance',
          description: 'Permission to export attendance data',
          module: 'attendance',
          action: 'export',
        }
      ];

      const createdPermissions = [];

      // Create attendance permissions
      for (const permissionData of attendancePermissions) {
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

      // Update admin role with new attendance permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new attendance permissions)
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
        
        console.log('Admin role updated with attendance permissions');
      } else {
        console.log('Admin role not found. Please run roles seeder first.');
      }

      console.log('Attendance permissions seeding completed successfully!');
      return true;
    } catch (error) {
      console.error('Error seeding attendance permissions:', error);
      return false;
    }
  }
} 