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
exports.UsersSeeder = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const role_schema_1 = require("../roles/schemas/role.schema");
const bcrypt = require("bcrypt");
let UsersSeeder = class UsersSeeder {
    constructor(userModel, roleModel) {
        this.userModel = userModel;
        this.roleModel = roleModel;
    }
    async seed() {
        try {
            console.log('Starting users seeding...');
            const adminRole = await this.roleModel.findOne({ name: 'admin' });
            if (!adminRole) {
                console.log('Admin role not found. Please run the roles seeder first.');
                return;
            }
            const existingAdminUser = await this.userModel.findOne({ email: 'admin@cbms.com' });
            if (existingAdminUser) {
                console.log('Admin user already exists. Updating...');
                const hashedPassword = await bcrypt.hash('P@ssword', 10);
                await this.userModel.findByIdAndUpdate(existingAdminUser._id, {
                    name: 'admin',
                    email: 'admin@cbms.com',
                    password: hashedPassword,
                    role: adminRole._id
                }, { new: true });
                console.log('Admin user updated successfully');
            }
            else {
                const hashedPassword = await bcrypt.hash('P@ssword', 10);
                const adminUser = new this.userModel({
                    name: 'admin',
                    email: 'admin@cbms.com',
                    password: hashedPassword,
                    role: adminRole._id
                });
                await adminUser.save();
                console.log('Admin user created successfully');
            }
            console.log('Users seeding completed successfully');
        }
        catch (error) {
            console.error('Error seeding users:', error);
            throw error;
        }
    }
};
exports.UsersSeeder = UsersSeeder;
exports.UsersSeeder = UsersSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersSeeder);
//# sourceMappingURL=users.seeder.js.map