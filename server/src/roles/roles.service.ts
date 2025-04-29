import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(createRoleDto: { name: string; description?: string }): Promise<Role> {
    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions');
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).populate('permissions');
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, updateRoleDto: { name?: string; description?: string }): Promise<Role> {
    const role = await this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async remove(id: string): Promise<Role> {
    const role = await this.roleModel.findByIdAndDelete(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
} 