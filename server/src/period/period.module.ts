import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Period, PeriodSchema } from './period.schema';
import { PeriodService } from './period.service';
import { PeriodController } from './period.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Period.name, schema: PeriodSchema },
    ]),
  ],
  controllers: [PeriodController],
  providers: [PeriodService],
  exports: [PeriodService],
})
export class PeriodModule {} 