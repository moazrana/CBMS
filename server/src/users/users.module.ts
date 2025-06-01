import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { RolePermissionService } from './services/role-permission.service';
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
    forwardRef(() => RolesModule)
  ],
  controllers: [UsersController],
  providers: [
    UsersService, 
    RolePermissionService, 
    PermissionsSeeder,
    SeedPermissionsCommand
  ],
  exports: [UsersService, RolePermissionService],
})
export class UsersModule {} 