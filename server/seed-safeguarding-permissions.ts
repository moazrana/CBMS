import { NestFactory } from '@nestjs/core';
import { SeederModule } from './src/seeders/seeder.module';
import { SafeguardingPermissionsSeeder } from './src/seeders/safeguarding-permissions.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const safeguardingPermissionsSeeder = app.get(SafeguardingPermissionsSeeder);
    await safeguardingPermissionsSeeder.seed();
    console.log('Safeguarding permissions seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding safeguarding permissions:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 