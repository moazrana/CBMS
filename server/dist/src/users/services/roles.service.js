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
let RolesService = class RolesService {
    constructor(roleModel) {
        this.roleModel = roleModel;
    }
    async create(createRoleDto) {
        const createdRole = new this.roleModel(createRoleDto);
        return createdRole.save();
    }
    async findAll() {
        return this.roleModel.find().exec();
    }
    async findOne(id) {
        const role = await this.roleModel.findById(id).exec();
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async findByName(name) {
        const role = await this.roleModel.findOne({ name }).exec();
        if (!role) {
            throw new common_1.NotFoundException(`Role with name ${name} not found`);
        }
        return role;
    }
    async update(id, updateRoleDto) {
        const updatedRole = await this.roleModel
            .findByIdAndUpdate(id, updateRoleDto, { new: true })
            .exec();
        if (!updatedRole) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return updatedRole;
    }
    async remove(id) {
        const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();
        if (!deletedRole) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return deletedRole;
    }
    async addPermissionToRole(roleId, permission) {
        const role = await this.findOne(roleId);
        const permissionExists = role.permissions.some(p => p.name === permission.name && p.module === permission.module && p.action === permission.action);
        if (!permissionExists) {
            role.permissions.push(permission);
            return this.roleModel.findByIdAndUpdate(roleId, { permissions: role.permissions }, { new: true }).exec();
        }
        return role;
    }
    async removePermissionFromRole(roleId, permissionId) {
        const role = await this.findOne(roleId);
        role.permissions = role.permissions.filter(p => p._id.toString() !== permissionId);
        return this.roleModel.findByIdAndUpdate(roleId, { permissions: role.permissions }, { new: true }).exec();
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map