import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './roles.controller';
import { RolesService } from './services/roles.service';
import { RolePermissionService } from './services/role-permission.service';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema }
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolePermissionService],
  exports: [RolesService, RolePermissionService],
})
export class RolesModule {} 