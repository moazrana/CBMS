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
exports.RolesSeeder = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("../schemas/role.schema");
const permission_schema_1 = require("../schemas/permission.schema");
let RolesSeeder = class RolesSeeder {
    constructor(roleModel, permissionModel) {
        this.roleModel = roleModel;
        this.permissionModel = permissionModel;
    }
    async seed() {
        try {
            console.log('Starting roles seeding...');
            const allPermissions = await this.permissionModel.find().exec();
            if (allPermissions.length === 0) {
                console.log('No permissions found. Please run the permissions seeder first.');
                return;
            }
            const existingAdminRole = await this.roleModel.findOne({ name: 'admin' });
            if (existingAdminRole) {
                console.log('Admin role already exists. Updating permissions...');
                await this.roleModel.findByIdAndUpdate(existingAdminRole._id, {
                    permissions: allPermissions.map(p => ({
                        name: p.name,
                        description: p.description,
                        module: p.module,
                        action: p.action
                    }))
                }, { new: true });
                console.log('Admin role updated with all permissions');
            }
            else {
                const adminRole = new this.roleModel({
                    name: 'admin',
                    description: 'Administrator role with full access',
                    permissions: allPermissions.map(p => ({
                        name: p.name,
                        description: p.description,
                        module: p.module,
                        action: p.action
                    })),
                    isDefault: false
                });
                await adminRole.save();
                console.log('Admin role created with all permissions');
            }
            const existingUserRole = await this.roleModel.findOne({ name: 'user' });
            if (!existingUserRole) {
                const userRole = new this.roleModel({
                    name: 'user',
                    description: 'Regular user role',
                    permissions: [
                        {
                            name: 'user_read',
                            description: 'Read user information',
                            module: 'users',
                            action: 'read'
                        }
                    ],
                    isDefault: true
                });
                await userRole.save();
                console.log('User role created with limited permissions');
            }
            console.log('Roles seeding completed successfully');
        }
        catch (error) {
            console.error('Error seeding roles:', error);
            throw error;
        }
    }
};
exports.RolesSeeder = RolesSeeder;
exports.RolesSeeder = RolesSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(1, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RolesSeeder);
//# sourceMappingURL=roles.seeder.js.map