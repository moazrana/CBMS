import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
import { Permission } from '../permissions/schemas/permission.schema';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await this.roleModel.findById(roleId).populate('permissions');
    return role ? role.permissions.map(permission => permission.name) : [];
  }

  async hasPermission(roleId: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getRolePermissions(roleId);
    return permissions.includes(requiredPermission);
  }
} 