import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/has-permission.decorator';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private roleService: RolesService
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

    // Get fresh user data with role and permissions
    const role = await this.roleService.findOne(user.role.toString());
    if (!role) {
      throw new ForbiddenException('User role not found in database');
    }

    const rolePermissions = role.permissions || [];
    // Check if role has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission =>
      rolePermissions.some(p => p.name === permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(`Insufficient permissions. Required: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
} 