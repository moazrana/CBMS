import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionService } from '../../roles/services/role-permission.service';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private rolePermissionService;
    constructor(reflector: Reflector, rolePermissionService: RolePermissionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
