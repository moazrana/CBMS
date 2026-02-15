import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { Incident, IncidentSchema } from './schemas/incident.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { PeriodModule } from '../period/period.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name, schema: IncidentSchema },
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    PeriodModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {} 