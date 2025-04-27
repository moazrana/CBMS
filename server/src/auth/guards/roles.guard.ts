import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionService } from '../../users/services/role-permission.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolePermissionService: RolePermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<{ resource: string; action: string }[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Check if user has all required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.rolePermissionService.hasPermission(
        user.role._id,
        permission.resource,
        permission.action,
      );
      
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
} 