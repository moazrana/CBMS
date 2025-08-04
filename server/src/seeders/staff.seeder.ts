import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Role } from '../users/schemas/role.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting staff user seeding...');
      const staffRole = await this.roleModel.findOne({ name: 'Staff' });
      if (!staffRole) {
        console.log('Staff role not found. Please run the roles seeder first.');
        return;
      }
      const existingStaff = await this.userModel.findOne({ email: 'staff@cbms.com' });
      const hashedPassword = await bcrypt.hash('P@ssword', 10);
      const hashedPin = await bcrypt.hash('123', 10);
      if (existingStaff) {
        console.log('Staff user already exists. Updating...');
        await this.userModel.findByIdAndUpdate(
          existingStaff._id,
          {
            name: 'staff',
            email: 'staff@cbms.com',
            password: hashedPassword,
            pin: hashedPin,
            role: staffRole._id
          },
          { new: true }
        );
        console.log('Staff user updated successfully');
      } else {
        const staffUser = new this.userModel({
          name: 'staff',
          email: 'staff@cbms.com',
          password: hashedPassword,
          pin: hashedPin,
          role: staffRole._id
        });
        await staffUser.save();
        console.log('Staff user created successfully');
      }
      console.log('Staff user seeding completed successfully');
    } catch (error) {
      console.error('Error seeding staff user:', error);
      throw error;
    }
  }
} 