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
const permission_schema_1 = require("../schemas/permission.schema");
let PermissionsSeeder = class PermissionsSeeder {
    constructor(permissionModel) {
        this.permissionModel = permissionModel;
    }
    async seed() {
        try {
            const existingPermission = await this.permissionModel.findOne({
                name: 'create_user',
                module: 'users',
                action: 'create',
            });
            if (!existingPermission) {
                const addUserPermission = new this.permissionModel({
                    name: 'create_user',
                    description: 'Permission to create new users',
                    module: 'users',
                    action: 'create',
                });
                const updateUserPermission = new this.permissionModel({
                    name: 'update_user',
                    description: 'Permission to update user',
                    module: 'users',
                    action: 'update',
                });
                const readUserPermission = new this.permissionModel({
                    name: 'read_user',
                    description: 'Permission to view user',
                    module: 'users',
                    action: 'read',
                });
                const deleteUserPermission = new this.permissionModel({
                    name: 'delete_user',
                    description: 'Permission to delete user',
                    module: 'users',
                    action: 'delete',
                });
                await addUserPermission.save();
                await updateUserPermission.save();
                await readUserPermission.save();
                await deleteUserPermission.save();
                console.log('addUser permission seeded successfully');
            }
            else {
                console.log('addUser permission already exists');
            }
            return true;
        }
        catch (error) {
            console.error('Error seeding permissions:', error);
            return false;
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