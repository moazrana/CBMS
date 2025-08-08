import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../users/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { SeederService } from './seeder.service';
import { SeedCommand } from './seed.command';
import { PermissionsSeeder } from './permissions.seeder';
import { Permission, PermissionSchema } from '../users/schemas/permission.schema';
import { DashboardPermissionSeeder } from './dashboard-permission.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';
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
    ]),
  ],
  providers: [
    PermissionsSeeder, DashboardPermissionSeeder, RolePermissionsSeeder, SeederService, RolesSeeder, UsersSeeder, SeedCommand, TeacherSeeder,
    StudentSeeder, StaffSeeder, StudentSeedCommand, StaffSeedCommand
  ],
  exports: [SeederService, TeacherSeeder, StudentSeeder, StaffSeeder],
})
export class SeederModule {} 