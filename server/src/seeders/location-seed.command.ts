import { NestFactory } from '@nestjs/core';
import { LocationSeeder } from './location.seeder';
import { LocationModule } from '../location/location.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create({
    module: LocationModule,
    imports: [
      ConfigModule.forRoot(),
      MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/cbms'),
    ],
    providers: [LocationSeeder],
  } as any);
  const seeder = app.get(LocationSeeder);
  await seeder.seed();
  await app.close();
  console.log('Location seeding complete.');
}

bootstrap(); 