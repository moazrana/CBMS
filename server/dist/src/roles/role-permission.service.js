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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("./schemas/role.schema");
const permission_schema_1 = require("../permissions/schemas/permission.schema");
let RolePermissionService = class RolePermissionService {
    constructor(roleModel, permissionModel) {
        this.roleModel = roleModel;
        this.permissionModel = permissionModel;
    }
    async getRolePermissions(roleId) {
        const role = await this.roleModel.findById(roleId).populate('permissions');
        return role ? role.permissions.map(permission => permission.name) : [];
    }
    async hasPermission(roleId, requiredPermission) {
        const permissions = await this.getRolePermissions(roleId);
        return permissions.includes(requiredPermission);
    }
};
exports.RolePermissionService = RolePermissionService;
exports.RolePermissionService = RolePermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(1, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RolePermissionService);
//# sourceMappingURL=role-permission.service.js.map