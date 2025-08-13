import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../users/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Permission, PermissionSchema } from '../users/schemas/permission.schema';
import { Location, LocationSchema } from '../location/location.schema';
import { Period, PeriodSchema } from '../period/period.schema';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { SeederService } from './seeder.service';
import { SeedCommand } from './seed.command';
import { PermissionsSeeder } from './permissions.seeder';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';
import { SafeguardingPermissionsSeeder } from './safeguarding-permissions.seeder';
import { IncidentsPermissionsSeeder } from './incidents-permissions.seeder';
import { SafeguardingPermissionsSeedCommand } from './safeguarding-permissions-seed.command';
import { IncidentsPermissionsSeedCommand } from './incidents-permissions-seed.command';
import { LocationSeeder } from './location.seeder';
import { PeriodSeeder } from './period.seeder';
import { TeacherSeeder } from './teacher.seeder';
import { StudentSeeder } from './student.seeder';
import { StaffSeeder } from './staff.seeder';
import { StudentSeedCommand } from './student-seed.command';
import { StaffSeedCommand } from './staff-seed.command';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cbms'),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Period.name, schema: PeriodSchema },
    ]),
  ],
  providers: [
    PermissionsSeeder, 
    DashboardPermissionSeeder, 
    RolePermissionsSeeder, 
    SafeguardingPermissionsSeeder,
    IncidentsPermissionsSeeder,
    SafeguardingPermissionsSeedCommand,
    IncidentsPermissionsSeedCommand,
    LocationSeeder,
    PeriodSeeder,
    SeederService, 
    RolesSeeder, 
    UsersSeeder, 
    SeedCommand, 
    TeacherSeeder,
    StudentSeeder, 
    StaffSeeder, 
    StudentSeedCommand, 
    StaffSeedCommand
  ],
  exports: [SeederService, TeacherSeeder, StudentSeeder, StaffSeeder],
})
export class SeederModule {} 