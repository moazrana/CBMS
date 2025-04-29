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
exports.PermissionsSeeder = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const permission_schema_1 = require("../permissions/schemas/permission.schema");
let PermissionsSeeder = class PermissionsSeeder {
    constructor(permissionModel) {
        this.permissionModel = permissionModel;
    }
    async seed() {
        const permissions = [
            {
                name: 'create:users',
                description: 'Can create new users',
                module: 'users',
            },
            {
                name: 'read:users',
                description: 'Can view users',
                module: 'users',
            },
            {
                name: 'update:users',
                description: 'Can update users',
                module: 'users',
            },
            {
                name: 'delete:users',
                description: 'Can delete users',
                module: 'users',
            },
            {
                name: 'create:roles',
                description: 'Can create new roles',
                module: 'roles',
            },
            {
                name: 'read:roles',
                description: 'Can view roles',
                module: 'roles',
            },
            {
                name: 'update:roles',
                description: 'Can update roles',
                module: 'roles',
            },
            {
                name: 'delete:roles',
                description: 'Can delete roles',
                module: 'roles',
            },
            {
                name: 'create:permissions',
                description: 'Can create new permissions',
                module: 'permissions',
            },
            {
                name: 'read:permissions',
                description: 'Can view permissions',
                module: 'permissions',
            },
            {
                name: 'update:permissions',
                description: 'Can update permissions',
                module: 'permissions',
            },
            {
                name: 'delete:permissions',
                description: 'Can delete permissions',
                module: 'permissions',
            },
        ];
        for (const permission of permissions) {
            const exists = await this.permissionModel.findOne({ name: permission.name });
            if (!exists) {
                await this.permissionModel.create(permission);
            }
        }
    }
};
exports.PermissionsSeeder = PermissionsSeeder;
exports.PermissionsSeeder = PermissionsSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PermissionsSeeder);
//# sourceMappingURL=permissions.seeder.js.map