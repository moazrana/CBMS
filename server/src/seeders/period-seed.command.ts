import { NestFactory } from '@nestjs/core';
import { PeriodSeeder } from './period.seeder';
import { PeriodModule } from '../period/period.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create({
    module: PeriodModule,
    imports: [
      ConfigModule.forRoot(),
      MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/cbms'),
    ],
    providers: [PeriodSeeder],
  } as any);
  const seeder = app.get(PeriodSeeder);
  await seeder.seed();
  await app.close();
  console.log('Period seeding complete.');
}

bootstrap(); 