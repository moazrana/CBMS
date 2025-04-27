import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission } from '../schemas/permission.schema';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  // Role methods
  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = new this.roleModel(roleData);
    return role.save();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async getRoleById(id: string): Promise<Role> {
    return this.roleModel.findById(id).exec();
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    return this.roleModel
      .findByIdAndUpdate(id, roleData, { new: true })
      .exec();
  }

  async addPermissionToRole(roleId: string, permission: Permission): Promise<Role> {
    return this.roleModel
      .findByIdAndUpdate(
        roleId,
        { $addToSet: { permissions: permission } },
        { new: true }
      )
      .exec();
  }

  async removePermissionFromRole(roleId: string, permissionName: string): Promise<Role> {
    return this.roleModel
      .findByIdAndUpdate(
        roleId,
        { $pull: { permissions: { name: permissionName } } },
        { new: true }
      )
      .exec();
  }

  // Check if user has specific permission
  async hasPermission(roleId: string, module: string, action: string): Promise<boolean> {
    const role = await this.roleModel.findById(roleId).exec();

    if (!role) return false;

    return role.permissions.some(
      (permission) =>
        permission.module === module && permission.action === action
    );
  }

  // Get all permissions for a role
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleModel.findById(roleId).exec();
    return role ? role.permissions : [];
  }

  // Update role permissions
  async updateRolePermissions(roleId: string, permissions: Permission[]): Promise<Role> {
    return this.roleModel
      .findByIdAndUpdate(
        roleId,
        { $set: { permissions } },
        { new: true }
      )
      .exec();
  }
} 