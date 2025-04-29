import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RolePermissionService } from './role-permission.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema }
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolePermissionService],
  exports: [RolesService, RolePermissionService]
})
export class RolesModule {} 