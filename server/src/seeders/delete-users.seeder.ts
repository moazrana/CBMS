import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class DeleteUsersSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async seed() {
    try {
      console.log('🗑️  Starting users deletion process...');
      
      // Get count of users before deletion
      const userCount = await this.userModel.countDocuments();
      console.log(`📊 Found ${userCount} users in the database`);
      
      if (userCount === 0) {
        console.log('ℹ️  No users found to delete');
        return;
      }

      // Delete all users
      const deleteResult = await this.userModel.deleteMany({});
      
      console.log(`✅ Successfully deleted ${deleteResult.deletedCount} users from the database`);
      console.log('🎉 Users deletion completed successfully!');
      
      return {
        deletedCount: deleteResult.deletedCount,
        message: 'All users deleted successfully'
      };
    } catch (error) {
      console.error('💥 Error deleting users:', error);
      throw error;
    }
  }

  async clear() {
    return this.seed();
  }
}
