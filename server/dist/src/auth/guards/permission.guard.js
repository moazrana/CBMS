"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const has_permission_decorator_1 = require("../decorators/has-permission.decorator");
const users_service_1 = require("../../users/users.service");
const roles_service_1 = require("../../roles/roles.service");
let PermissionGuard = class PermissionGuard {
    constructor(reflector, usersService, roleService) {
        this.reflector = reflector;
        this.usersService = usersService;
        this.roleService = roleService;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.get(has_permission_decorator_1.PERMISSIONS_KEY, context.getHandler());
        if (!requiredPermissions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = await this.usersService.findOne(request.user._id);
        if (!user) {
            throw new common_1.ForbiddenException('User not found in request');
        }
        if (!user.role) {
            throw new common_1.ForbiddenException('User has no role assigned');
        }
        const role = await this.roleService.findOne(user.role.toString());
        if (!role) {
            throw new common_1.ForbiddenException('User role not found in database');
        }
        const rolePermissions = role.permissions || [];
        const hasAllPermissions = requiredPermissions.every(permission => rolePermissions.some(p => p.name === permission));
        if (!hasAllPermissions) {
            throw new common_1.ForbiddenException(`Insufficient permissions. Required: ${requiredPermissions.join(', ')}`);
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        users_service_1.UsersService,
        roles_service_1.RolesService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map