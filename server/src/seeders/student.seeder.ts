import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Role } from '../users/schemas/role.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting student user seeding...');
      const studentRole = await this.roleModel.findOne({ name: 'Student' });
      if (!studentRole) {
        console.log('Student role not found. Please run the roles seeder first.');
        return;
      }
      const existingStudent = await this.userModel.findOne({ email: 'student@cbms.com' });
      const hashedPassword = await bcrypt.hash('P@ssword', 10);
      const hashedPin = await bcrypt.hash('123', 10);
      if (existingStudent) {
        console.log('Student user already exists. Updating...');
        await this.userModel.findByIdAndUpdate(
          existingStudent._id,
          {
            name: 'student',
            email: 'student@cbms.com',
            password: hashedPassword,
            pin: hashedPin,
            role: studentRole._id
          },
          { new: true }
        );
        console.log('Student user updated successfully');
      } else {
        const studentUser = new this.userModel({
          name: 'student',
          email: 'student@cbms.com',
          password: hashedPassword,
          pin: hashedPin,
          role: studentRole._id
        });
        await studentUser.save();
        console.log('Student user created successfully');
      }
      console.log('Student user seeding completed successfully');
    } catch (error) {
      console.error('Error seeding student user:', error);
      throw error;
    }
  }
} 