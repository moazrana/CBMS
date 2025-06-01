import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission } from '../../permissions/schemas/permission.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
// import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async create(role: any): Promise<boolean> {
    const createdRole = new this.roleModel({
      name: role.name,
      description: role.description,
      isDefault: role.isDefault,
      permissions: role.permissions,
    });
    return !!(await createdRole.save());
  }


  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async findOne(id: string): Promise<Role> {
    return this.roleModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Role> {
    return this.roleModel.findOne({ name }).exec();
  }

  async update(id: string, updateRoleDto: any): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    role.name=updateRoleDto.name;
    role.description=updateRoleDto.description;
    role.isDefault=updateRoleDto.isDefault;
    role.permissions=updateRoleDto.permissions;
    return role.save();
  }

  async remove(id: string): Promise<Role> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
} 