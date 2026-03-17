import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { Class, ClassSchema } from './class.schema';
import { ScheduleModule } from '../schedule/schedule.module';
import { PeriodModule } from '../period/period.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema }
    ]),
    ScheduleModule,
    PeriodModule,
    AuditLogModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService]
})
export class ClassModule {} 