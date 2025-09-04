import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionService } from '../../roles/services/role-permission.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolePermissionService: RolePermissionService,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Get user from database to ensure fresh data
    const user = await this.usersService.findOne(request.user._id);
    
    if (!user || !user.role) {
      return false;
    }

    // Check if user has any of the required roles
    for (const role of requiredRoles) {
      if (await this.rolePermissionService.checkRole(user.role, role)) {
        return true;
      }
    }

    return false;
  }
} 