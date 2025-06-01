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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("../schemas/role.schema");
const permission_schema_1 = require("../../permissions/schemas/permission.schema");
let RolesService = class RolesService {
    constructor(roleModel, permissionModel) {
        this.roleModel = roleModel;
        this.permissionModel = permissionModel;
    }
    async create(role) {
        const createdRole = new this.roleModel({
            name: role.name,
            description: role.description,
            isDefault: role.isDefault,
            permissions: role.permissions,
        });
        return !!(await createdRole.save());
    }
    async findAll() {
        return this.roleModel.find().exec();
    }
    async findOne(id) {
        return this.roleModel.findById(id).exec();
    }
    async findByName(name) {
        return this.roleModel.findOne({ name }).exec();
    }
    async update(id, updateRoleDto) {
        const role = await this.roleModel.findById(id).exec();
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        role.name = updateRoleDto.name;
        role.description = updateRoleDto.description;
        role.isDefault = updateRoleDto.isDefault;
        role.permissions = updateRoleDto.permissions;
        return role.save();
    }
    async remove(id) {
        return this.roleModel.findByIdAndDelete(id).exec();
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(1, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map