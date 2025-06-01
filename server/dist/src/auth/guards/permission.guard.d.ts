import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { RolePermissionService } from '../../roles/services/role-permission.service';
export declare class PermissionGuard implements CanActivate {
    private reflector;
    private usersService;
    private rolePermissionService;
    constructor(reflector: Reflector, usersService: UsersService, rolePermissionService: RolePermissionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
