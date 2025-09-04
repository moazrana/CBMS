import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class IncidentsPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting incidents permissions seeding...');
      
      const incidentsPermissions = [
        {
          name: 'create_incident',
          description: 'Permission to create new incidents',
          module: 'incidents',
          action: 'create',
        },
        {
          name: 'read_incident',
          description: 'Permission to view incidents',
          module: 'incidents',
          action: 'read',
        },
        {
          name: 'update_incident',
          description: 'Permission to update incidents',
          module: 'incidents',
          action: 'update',
        },
        {
          name: 'delete_incident',
          description: 'Permission to delete incidents',
          module: 'incidents',
          action: 'delete',
        },
        {
          name: 'approve_incident',
          description: 'Permission to approve incidents',
          module: 'incidents',
          action: 'approve',
        },
        {
          name: 'reject_incident',
          description: 'Permission to reject incidents',
          module: 'incidents',
          action: 'reject',
        },
        {
          name: 'export_incident',
          description: 'Permission to export incident reports',
          module: 'incidents',
          action: 'export',
        },
        {
          name: 'view_incident_reports',
          description: 'Permission to view incident reports',
          module: 'incidents',
          action: 'view_reports',
        },
        {
          name: 'manage_incident_settings',
          description: 'Permission to manage incident settings',
          module: 'incidents',
          action: 'manage_settings',
        },
        {
          name: 'assign_incident',
          description: 'Permission to assign incidents to staff',
          module: 'incidents',
          action: 'assign',
        },
        {
          name: 'escalate_incident',
          description: 'Permission to escalate incidents',
          module: 'incidents',
          action: 'escalate',
        },
        {
          name: 'resolve_incident',
          description: 'Permission to resolve incidents',
          module: 'incidents',
          action: 'resolve',
        },
      ];

      const createdPermissions = [];

      // Create incidents permissions
      for (const permissionData of incidentsPermissions) {
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

      // Update admin role with incidents permissions
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (adminRole) {
        // Get all existing permissions for admin role
        const allPermissions = await this.permissionModel.find().exec();
        
        // Update admin role with all permissions (including new incidents permissions)
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
        
        console.log('Admin role updated with incidents permissions');
      } else {
        console.log('Admin role not found. Please run the roles seeder first.');
      }

      console.log('Incidents permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding incidents permissions:', error);
      return false;
    }
  }
} 