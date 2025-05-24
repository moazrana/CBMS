import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';
export declare class PermissionGuard implements CanActivate {
    private reflector;
    private usersService;
    private roleService;
    constructor(reflector: Reflector, usersService: UsersService, roleService: RolesService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
