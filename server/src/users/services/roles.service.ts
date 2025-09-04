import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Permission } from '../schemas/permission.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleModel.findOne({ name }).exec();
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
    
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return updatedRole;
  }

  async remove(id: string): Promise<Role> {
    const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();
    if (!deletedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return deletedRole;
  }

  async addPermissionToRole(roleId: string, permission: Permission): Promise<Role> {
    const role = await this.findOne(roleId);
    
    // Check if permission already exists in the role
    const permissionExists = role.permissions.some(
      p => p.name === permission.name && p.module === permission.module && p.action === permission.action
    );
    
    if (!permissionExists) {
      role.permissions.push(permission);
      return this.roleModel.findByIdAndUpdate(roleId, { permissions: role.permissions }, { new: true }).exec();
    }
    
    return role;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    
    role.permissions = role.permissions.filter(
      p => p._id.toString() !== permissionId
    );
    
    return this.roleModel.findByIdAndUpdate(roleId, { permissions: role.permissions }, { new: true }).exec();
  }
} 