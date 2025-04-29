import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionService } from '../../roles/role-permission.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolePermissionService: RolePermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.role) {
      return false;
    }

    // Check if user has required role
    if (!requiredRoles.includes(user.role)) {
      return false;
    }

    // Get required permissions from metadata if any
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Check if user's role has all required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.rolePermissionService.hasPermission(user.role, permission);
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
} 