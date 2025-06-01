import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from '../users/schemas/permission.schema';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema }
    ]),
    RolesModule
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, RolesGuard],
  exports: [PermissionsService]
})
export class PermissionsModule {} 