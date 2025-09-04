import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { IncidentsPermissionsSeeder } from './incidents-permissions.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const incidentsPermissionsSeeder = app.get(IncidentsPermissionsSeeder);
    await incidentsPermissionsSeeder.seed();
    console.log('Incidents permissions seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding incidents permissions:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 