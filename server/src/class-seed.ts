import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { ClassSeeder } from './seeders/class.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const classSeeder = app.get(ClassSeeder);
    await classSeeder.seed();
    console.log('✅ Class seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during class seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 