import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { TeacherSeeder } from './teacher.seeder';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule);
  const teacherSeeder = app.get(TeacherSeeder);
  await teacherSeeder.seed();
  await app.close();
}

bootstrap(); 