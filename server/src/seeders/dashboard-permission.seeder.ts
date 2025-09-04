import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../users/schemas/permission.schema';

@Injectable()
export class DashboardPermissionSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async seed() {
    try {
      const existingPermission = await this.permissionModel.findOne({
        name: 'view_dashboard',
        module: 'dashboard',
        action: 'view',
      });

      if (!existingPermission) {
        const viewDashboardPermission = new this.permissionModel({
          name: 'view_dashboard',
          description: 'Permission to view the dashboard',
          module: 'dashboard',
          action: 'view',
        });
        await viewDashboardPermission.save();
        console.log('view_dashboard permission seeded successfully');
      } else {
        console.log('view_dashboard permission already exists');
      }
      return true;
    } catch (error) {
      console.error('Error seeding dashboard permission:', error);
      return false;
    }
  }
} 