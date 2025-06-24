import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { SeederService } from './seeder.service';
import { SeedCommand } from './seed.command';
import { permission } from 'process';
import { PermissionsSeeder } from './permissions.seeder';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/cbms'),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  providers: [PermissionsSeeder,SeederService, RolesSeeder, UsersSeeder, SeedCommand],
  exports: [SeederService],
})
export class SeederModule {} 