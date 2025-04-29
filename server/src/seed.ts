import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { SeederService } from './seeders/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule);
  const seederService = app.get(SeederService);
  await seederService.seed();
  await app.close();
}

bootstrap(); 