import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Role } from '../roles/schemas/role.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeeder {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async seed() {
    try {
      console.log('Starting users seeding...');
      
      // Get admin role
      const adminRole = await this.roleModel.findOne({ name: 'admin' });
      
      if (!adminRole) {
        console.log('Admin role not found. Please run the roles seeder first.');
        return;
      }
      
      // Check if admin user already exists
      const existingAdminUser = await this.userModel.findOne({ email: 'admin@cbms.com' });
      
      if (existingAdminUser) {
        console.log('Admin user already exists. Updating...');
        
        // Update admin user
        const hashedPassword = await bcrypt.hash('P@ssword', 10);
        await this.userModel.findByIdAndUpdate(
          existingAdminUser._id,
          { 
            name: 'admin',
            email: 'admin@cbms.com',
            password: hashedPassword,
            role: adminRole._id
          },
          { new: true }
        );
        
        console.log('Admin user updated successfully');
      } else {
        // Create admin user
        const hashedPassword = await bcrypt.hash('P@ssword', 10);
        const adminUser = new this.userModel({
          name: 'admin',
          email: 'admin@cbms.com',
          password: hashedPassword,
          role: adminRole._id
        });
        
        await adminUser.save();
        console.log('Admin user created successfully');
      }
      
      console.log('Users seeding completed successfully');
    } catch (error) {
      console.error('Error seeding users:', error);
      throw error;
    }
  }
} 