import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../users/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Permission, PermissionSchema } from '../users/schemas/permission.schema';
import { Location, LocationSchema } from '../location/location.schema';
import { Period, PeriodSchema } from '../period/period.schema';
import { Class, ClassSchema } from '../class/class.schema';
import { ClassModule } from '../class/class.module';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { SeederService } from './seeder.service';
import { SeedCommand } from './seed.command';
import { PermissionsSeeder } from './permissions.seeder';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';
import { SafeguardingPermissionsSeeder } from './safeguarding-permissions.seeder';
import { IncidentsPermissionsSeeder } from './incidents-permissions.seeder';
import { AttendancePermissionsSeeder } from './attendance-permissions.seeder';
import { TimetablePermissionsSeeder } from './timetable-permissions.seeder';
import { StaffPermissionsSeeder } from './staff-permissions.seeder';
import { StudentPermissionsSeeder } from './student-permissions.seeder';
import { SafeguardingPermissionsSeedCommand } from './safeguarding-permissions-seed.command';
import { IncidentsPermissionsSeedCommand } from './incidents-permissions-seed.command';
import { AttendancePermissionsSeedCommand } from './attendance-permissions-seed.command';
import { TimetablePermissionsSeedCommand } from './timetable-permissions-seed.command';
import { StaffPermissionsSeedCommand } from './staff-permissions-seed.command';
import { StudentPermissionsSeedCommand } from './student-permissions-seed.command';
import { LocationSeeder } from './location.seeder';
import { PeriodSeeder } from './period.seeder';
import { TeacherSeeder } from './teacher.seeder';
import { StudentSeeder } from './student.seeder';
import { StaffSeeder } from './staff.seeder';
import { ClassSeeder } from './class.seeder';
import { StudentSeedCommand } from './student-seed.command';
import { StaffSeedCommand } from './staff-seed.command';
import { DeleteUsersSeeder } from './delete-users.seeder';
import { DeleteUsersSeedCommand } from './delete-users-seed.command';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cbms'),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Period.name, schema: PeriodSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
    ClassModule,
  ],
  providers: [
    PermissionsSeeder, 
    DashboardPermissionSeeder, 
    RolePermissionsSeeder, 
    SafeguardingPermissionsSeeder,
    IncidentsPermissionsSeeder,
    AttendancePermissionsSeeder,
    TimetablePermissionsSeeder,
    StaffPermissionsSeeder,
    StudentPermissionsSeeder,
    SafeguardingPermissionsSeedCommand,
    IncidentsPermissionsSeedCommand,
    AttendancePermissionsSeedCommand,
    TimetablePermissionsSeedCommand,
    StaffPermissionsSeedCommand,
    StudentPermissionsSeedCommand,
    LocationSeeder,
    PeriodSeeder,
    SeederService, 
    RolesSeeder, 
    UsersSeeder, 
    SeedCommand, 
    TeacherSeeder,
    StudentSeeder, 
    StaffSeeder, 
    ClassSeeder,
    StudentSeedCommand, 
    StaffSeedCommand,
    DeleteUsersSeeder,
    DeleteUsersSeedCommand
  ],
  exports: [SeederService, TeacherSeeder, StudentSeeder, StaffSeeder, ClassSeeder, TimetablePermissionsSeeder, DeleteUsersSeeder],
})
export class SeederModule {}
