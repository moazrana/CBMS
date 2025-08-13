import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../users/schemas/role.schema';
import { Permission } from '../users/schemas/permission.schema';

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

      // Create student role if it doesn't exist
      const existingStudentRole = await this.roleModel.findOne({ name: 'Student' });
      
      if (!existingStudentRole) {
        // Create student role with student-specific permissions
        const studentRole = new this.roleModel({
          name: 'Student',
          description: 'Student role with access to student-specific features',
          permissions: [
            {
              name: 'student_read',
              description: 'Read student information',
              module: 'students',
              action: 'read'
            },
            {
              name: 'certificate_view',
              description: 'View own certificates',
              module: 'certificates',
              action: 'read'
            },
            {
              name: 'document_view',
              description: 'View own documents',
              module: 'documents',
              action: 'read'
            }
          ],
          isDefault: false
        });
        
        await studentRole.save();
        console.log('Student role created with student permissions');
      }

      // Create teacher role if it doesn't exist
      const existingTeacherRole = await this.roleModel.findOne({ name: 'Teacher' });
      
      if (!existingTeacherRole) {
        // Create teacher role with teacher-specific permissions
        const teacherRole = new this.roleModel({
          name: 'Teacher',
          description: 'Teacher role with access to teaching and student management features',
          permissions: [
            {
              name: 'student_read',
              description: 'Read student information',
              module: 'students',
              action: 'read'
            },
            {
              name: 'student_write',
              description: 'Create and update student information',
              module: 'students',
              action: 'write'
            },
            {
              name: 'certificate_manage',
              description: 'Manage student certificates',
              module: 'certificates',
              action: 'manage'
            },
            {
              name: 'document_manage',
              description: 'Manage student documents',
              module: 'documents',
              action: 'manage'
            },
            {
              name: 'attendance_manage',
              description: 'Manage student attendance',
              module: 'attendance',
              action: 'manage'
            },
            {
              name: 'reports_view',
              description: 'View reports and analytics',
              module: 'reports',
              action: 'read'
            }
          ],
          isDefault: false
        });
        
        await teacherRole.save();
        console.log('Teacher role created with teacher permissions');
      }

      // Create staff role if it doesn't exist
      const existingStaffRole = await this.roleModel.findOne({ name: 'Staff' });
      
      if (!existingStaffRole) {
        // Create staff role with staff-specific permissions
        const staffRole = new this.roleModel({
          name: 'Staff',
          description: 'Staff role with administrative and support permissions',
          permissions: [
            {
              name: 'student_read',
              description: 'Read student information',
              module: 'students',
              action: 'read'
            },
            {
              name: 'user_manage',
              description: 'Manage users and accounts',
              module: 'users',
              action: 'manage'
            },
            {
              name: 'certificate_approve',
              description: 'Approve or reject certificates',
              module: 'certificates',
              action: 'approve'
            },
            {
              name: 'document_approve',
              description: 'Approve or reject documents',
              module: 'documents',
              action: 'approve'
            },
            {
              name: 'reports_generate',
              description: 'Generate and export reports',
              module: 'reports',
              action: 'write'
            },
            {
              name: 'system_settings',
              description: 'Access system settings',
              module: 'settings',
              action: 'read'
            }
          ],
          isDefault: false
        });
        
        await staffRole.save();
        console.log('Staff role created with staff permissions');
      }
      
      console.log('Roles seeding completed successfully');
    } catch (error) {
      console.error('Error seeding roles:', error);
      throw error;
    }
  }
} 