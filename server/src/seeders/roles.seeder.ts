import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async seed() {
    const roles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user with limited access' },
    ];

    for (const role of roles) {
      const exists = await this.roleModel.findOne({ name: role.name });
      if (!exists) {
        await this.roleModel.create(role);
      }
    }
  }
} 