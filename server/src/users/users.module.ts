import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { RolePermissionService } from './services/role-permission.service';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { PermissionsSeeder } from './seeders/permissions.seeder';
import { SeedPermissionsCommand } from './seeders/seed-permissions.command';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    RolesModule
  ],
  controllers: [UsersController, RolesController],
  providers: [
    UsersService, 
    RolePermissionService, 
    RolesService, 
    PermissionsSeeder,
    SeedPermissionsCommand
  ],
  exports: [UsersService, RolePermissionService, RolesService],
})
export class UsersModule {} 