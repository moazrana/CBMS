import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { RolesSeeder } from './src/users/seeders/roles.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    console.log('Starting roles seeding...');
    const seeder = app.get(RolesSeeder);
    await seeder.seed();
    console.log('Roles seeding completed successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 