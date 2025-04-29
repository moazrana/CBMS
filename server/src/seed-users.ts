import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { UsersSeeder } from './seeders/users.seeder';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule);
  const usersSeeder = app.get(UsersSeeder);
  await usersSeeder.seed();
  await app.close();
}

bootstrap(); 