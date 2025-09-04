import { Injectable } from '@nestjs/common';
import { ClassService } from '../class/class.service';
import { CreateClassDto } from '../class/dto/create-class.dto';

@Injectable()
export class ClassSeeder {
  constructor(private readonly classService: ClassService) {}

  async seed() {
    const classNames: string[] = [
      'Achieve -Construction',
      'Achieve -Motor Vehicle',
      'Hairdressing',
      'Maths /English',
      'Outreach',
      'Post 16',
      'Warrington - Math /English',
      'Warrington -Construction',
      'Warrington -Hairdressing',
      'Warrington -Motor Vehicle',
      'Warrington -Outreach',
      'Warrington- Post 16',
      'Construction',
      'English',
      'Guitar lesson',
      'Gym',
      'Hairdressing'
    ];

    console.log('Starting to seed classes...');

    for (const name of classNames) {
      try {
        const createClassDto: CreateClassDto = { 
          name,
          isActive: true,
          status: 'Active',
          subject: 'General',
          academicYear: new Date()
        };
        
        await this.classService.create(createClassDto);
        console.log(`✅ Seeded class: ${name}`);
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          console.log(`⚠️  Class already exists: ${name}`);
        } else {
          console.error(`❌ Error seeding class ${name}:`, error.message);
        }
      }
    }

    console.log('Class seeding completed!');
  }

  async clear() {
    try {
      console.log('Clearing all classes...');
      await this.classService.removeAll();
      console.log('Classes cleared successfully.');
    } catch (error) {
      console.error('Error clearing classes:', error.message);
    }
  }
} 