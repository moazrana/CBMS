import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = new this.roleModel({
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions: createRoleDto.permissions
    });
    return role.save();
  }

  async findAll(sort: string, order: string, search: string, page: number, perPage: number): Promise<Role[]> {
    return this.roleModel.find({deletedAt: null})
    // .populate('permissions')
    .sort({ [sort]: order === 'DESC' ? -1 : 1 })
      .where({
        $or: [
          { name: { $regex: search || '', $options: 'i' } },
          { email: { $regex: search || '', $options: 'i' } }
        ]
      })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean()
      .exec()
      .then(roles => {
        return roles.map((role, index) => ({
          ...role,
          id: ((page - 1) * perPage) + index + 1
        }));
      });
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