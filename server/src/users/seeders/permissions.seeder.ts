import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../schemas/permission.schema';

@Injectable()
export class PermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async seed() {
    try {
      // Check if addUser permission already exists
      const existingPermission = await this.permissionModel.findOne({
        name: 'create_user',
        module: 'users',
        action: 'create',
      });

      if (!existingPermission) {
        // Create addUser permission
        const addUserPermission = new this.permissionModel({
          name: 'create_user',
          description: 'Permission to create new users',
          module: 'users',
          action: 'create',
        });
        
        const updateUserPermission = new this.permissionModel({
          name: 'update_user',
          description: 'Permission to create new users',
          module: 'users',
          action: 'update',
        });
        
        const readUserPermission = new this.permissionModel({
          name: 'read_user',
          description: 'Permission to create new users',
          module: 'users',
          action: 'read',
        });
        
        const deleteUserPermission = new this.permissionModel({
          name: 'delete_user',
          description: 'Permission to create new users',
          module: 'users',
          action: 'delete',
        });

        await addUserPermission.save();
        await updateUserPermission.save();
        await readUserPermission.save();
        await deleteUserPermission.save();
        console.log('addUser permission seeded successfully');
      } else {
        console.log('addUser permission already exists');
      }

      return true;
    } catch (error) {
      console.error('Error seeding permissions:', error);
      return false;
    }
  }
} 