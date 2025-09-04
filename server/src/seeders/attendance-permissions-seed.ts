import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { AttendancePermissionsSeeder } from './attendance-permissions.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const attendancePermissionsSeeder = app.get(AttendancePermissionsSeeder);
    const result = await attendancePermissionsSeeder.seed();
    
    if (result) {
      console.log('✅ Attendance permissions seeded successfully!');
    } else {
      console.log('❌ Failed to seed attendance permissions');
    }
  } catch (error) {
    console.error('❌ Error seeding attendance permissions:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 