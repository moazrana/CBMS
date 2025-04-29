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
const role_schema_1 = require("./schemas/role.schema");
let RolesService = class RolesService {
    constructor(roleModel) {
        this.roleModel = roleModel;
    }
    async create(createRoleDto) {
        const role = new this.roleModel(createRoleDto);
        return role.save();
    }
    async findAll() {
        return this.roleModel.find().populate('permissions');
    }
    async findOne(id) {
        const role = await this.roleModel.findById(id).populate('permissions');
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async update(id, updateRoleDto) {
        const role = await this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async remove(id) {
        const role = await this.roleModel.findByIdAndDelete(id);
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map