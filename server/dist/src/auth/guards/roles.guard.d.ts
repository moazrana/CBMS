import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionService } from '../../roles/services/role-permission.service';
import { UsersService } from '../../users/users.service';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private rolePermissionService;
    private usersService;
    constructor(reflector: Reflector, rolePermissionService: RolePermissionService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
