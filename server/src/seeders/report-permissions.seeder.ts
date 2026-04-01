import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';
import { Role } from '../users/schemas/role.schema';

@Injectable()
export class ReportPermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting report permissions seeding...');

      const reportPermissions = [
        { name: 'read_reports', description: 'Permission to view reports', module: 'reports', action: 'read' },
        { name: 'read_incident_report', description: 'Permission to view incident reports tab', module: 'reports', action: 'read_incident' },
        { name: 'read_safeguard_report', description: 'Permission to view safeguarding reports tab', module: 'reports', action: 'read_safeguard' },
        { name: 'read_weekly_report', description: 'Permission to view weekly reports tab', module: 'reports', action: 'read_weekly' },
        { name: 'read_monthly_report', description: 'Permission to view monthly reports tab', module: 'reports', action: 'read_monthly' },
        { name: 'download_incident_report', description: 'Permission to download incident reports', module: 'reports', action: 'download_incident' },
        { name: 'download_safeguard_report', description: 'Permission to download safeguarding reports', module: 'reports', action: 'download_safeguard' },
        { name: 'download_weekly_report', description: 'Permission to download weekly reports', module: 'reports', action: 'download_weekly' },
        { name: 'download_monthly_report', description: 'Permission to download monthly reports', module: 'reports', action: 'download_monthly' },
      ];

      const createdPermissions: Permission[] = [];

      for (const permissionData of reportPermissions) {
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

      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      if (adminRole) {
        const allPermissions = await this.permissionModel.find().exec();
        await this.roleModel.findByIdAndUpdate(
          adminRole._id,
          {
            permissions: allPermissions.map((p) => ({
              name: p.name,
              description: p.description,
              module: p.module,
              action: p.action,
            })),
          },
          { new: true },
        );
        console.log('Admin role updated with all permissions including monthly report permissions');
      } else {
        console.log('Admin role not found. Monthly report permissions created but not assigned to any role yet.');
        // Try to find any admin/superadmin role
        const superAdminRole = await this.roleModel.findOne({ $or: [{ name: 'superadmin' }, { name: 'Super Admin' }, { name: 'Admin' }] });
        if (superAdminRole) {
          const allPermissions = await this.permissionModel.find().exec();
          await this.roleModel.findByIdAndUpdate(superAdminRole._id, {
            permissions: allPermissions.map((p) => ({
              name: p.name,
              description: p.description,
              module: p.module,
              action: p.action,
            })),
          });
          console.log(`${superAdminRole.name} role updated with monthly report permissions`);
        }
      }

      console.log('Report permissions seeding completed successfully');
      return true;
    } catch (error) {
      console.error('Error seeding report permissions:', error);
      return false;
    }
  }
}
