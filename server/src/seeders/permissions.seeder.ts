import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../permissions/schemas/permission.schema';

@Injectable()
export class PermissionsSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async seed() {
    const permissions = [
      {
        name: 'create:users',
        description: 'Can create new users',
        module: 'users',
      },
      {
        name: 'read:users',
        description: 'Can view users',
        module: 'users',
      },
      {
        name: 'update:users',
        description: 'Can update users',
        module: 'users',
      },
      {
        name: 'delete:users',
        description: 'Can delete users',
        module: 'users',
      },
      {
        name: 'create:roles',
        description: 'Can create new roles',
        module: 'roles',
      },
      {
        name: 'read:roles',
        description: 'Can view roles',
        module: 'roles',
      },
      {
        name: 'update:roles',
        description: 'Can update roles',
        module: 'roles',
      },
      {
        name: 'delete:roles',
        description: 'Can delete roles',
        module: 'roles',
      },
      {
        name: 'create:permissions',
        description: 'Can create new permissions',
        module: 'permissions',
      },
      {
        name: 'read:permissions',
        description: 'Can view permissions',
        module: 'permissions',
      },
      {
        name: 'update:permissions',
        description: 'Can update permissions',
        module: 'permissions',
      },
      {
        name: 'delete:permissions',
        description: 'Can delete permissions',
        module: 'permissions',
      },
    ];

    for (const permission of permissions) {
      const exists = await this.permissionModel.findOne({ name: permission.name });
      if (!exists) {
        await this.permissionModel.create(permission);
      }
    }
  }
} 