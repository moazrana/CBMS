import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RolePermissionsSeeder } from './role-permissions.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    console.log('Starting role permissions seeding...');
    const seeder = app.get(RolePermissionsSeeder);
    await seeder.seed();
    console.log('Role permissions seeding completed successfully');
  } catch (error) {
    console.error('Error seeding role permissions:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 