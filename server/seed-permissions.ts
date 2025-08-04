import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PermissionsSeeder } from './src/seeders/permissions.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    console.log('Starting permissions seeding...');
    const seeder = app.get(PermissionsSeeder);
    await seeder.seed();
    console.log('Permissions seeding completed successfully');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 