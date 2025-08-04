import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Role } from '../users/schemas/role.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting teacher user seeding...');
      // Get teacher role
      const teacherRole = await this.roleModel.findOne({ name: 'teacher' });
      if (!teacherRole) {
        console.log('Teacher role not found. Please run the roles seeder first.');
        return;
      }
      // Check if teacher user already exists
      const existingTeacher = await this.userModel.findOne({ email: 'teacher@cbms.com' });
      const hashedPassword = await bcrypt.hash('P@ssword', 10);
      const hashedPin = await bcrypt.hash('123', 10);
      if (existingTeacher) {
        console.log('Teacher user already exists. Updating...');
        await this.userModel.findByIdAndUpdate(
          existingTeacher._id,
          {
            name: 'teacher',
            email: 'teacher@cbms.com',
            password: hashedPassword,
            pin: hashedPin,
            role: teacherRole._id
          },
          { new: true }
        );
        console.log('Teacher user updated successfully');
      } else {
        // Create teacher user
        const teacherUser = new this.userModel({
          name: 'teacher',
          email: 'teacher@cbms.com',
          password: hashedPassword,
          pin: hashedPin,
          role: teacherRole._id
        });
        await teacherUser.save();
        console.log('Teacher user created successfully');
      }
      console.log('Teacher user seeding completed successfully');
    } catch (error) {
      console.error('Error seeding teacher user:', error);
      throw error;
    }
  }
} 