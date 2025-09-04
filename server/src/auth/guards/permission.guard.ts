import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/has-permission.decorator';
import { UsersService } from '../../users/users.service';
import { RolePermissionService } from '../../roles/services/role-permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private rolePermissionService: RolePermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Get user from database to ensure fresh data
    const user = await this.usersService.findOne(request.user._id);
    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    if (!user.role) {
      throw new ForbiddenException('User has no role assigned');
    }

    // Check if user has all required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.rolePermissionService.hasPermission(
        user.role.toString(),
        permission
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient permissions. Required: ${requiredPermissions.join(', ')}`);
      }
    }

    return true;
  }
} 