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
const role_schema_1 = require("../users/schemas/role.schema");
const permission_schema_1 = require("../users/schemas/permission.schema");
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
            const existingStudentRole = await this.roleModel.findOne({ name: 'Student' });
            if (!existingStudentRole) {
                const studentRole = new this.roleModel({
                    name: 'Student',
                    description: 'Student role with access to student-specific features',
                    permissions: [
                        {
                            name: 'student_read',
                            description: 'Read student information',
                            module: 'students',
                            action: 'read'
                        },
                        {
                            name: 'certificate_view',
                            description: 'View own certificates',
                            module: 'certificates',
                            action: 'read'
                        },
                        {
                            name: 'document_view',
                            description: 'View own documents',
                            module: 'documents',
                            action: 'read'
                        }
                    ],
                    isDefault: false
                });
                await studentRole.save();
                console.log('Student role created with student permissions');
            }
            const existingTeacherRole = await this.roleModel.findOne({ name: 'Teacher' });
            if (!existingTeacherRole) {
                const teacherRole = new this.roleModel({
                    name: 'Teacher',
                    description: 'Teacher role with access to teaching and student management features',
                    permissions: [
                        {
                            name: 'student_read',
                            description: 'Read student information',
                            module: 'students',
                            action: 'read'
                        },
                        {
                            name: 'student_write',
                            description: 'Create and update student information',
                            module: 'students',
                            action: 'write'
                        },
                        {
                            name: 'certificate_manage',
                            description: 'Manage student certificates',
                            module: 'certificates',
                            action: 'manage'
                        },
                        {
                            name: 'document_manage',
                            description: 'Manage student documents',
                            module: 'documents',
                            action: 'manage'
                        },
                        {
                            name: 'attendance_manage',
                            description: 'Manage student attendance',
                            module: 'attendance',
                            action: 'manage'
                        },
                        {
                            name: 'reports_view',
                            description: 'View reports and analytics',
                            module: 'reports',
                            action: 'read'
                        }
                    ],
                    isDefault: false
                });
                await teacherRole.save();
                console.log('Teacher role created with teacher permissions');
            }
            const existingStaffRole = await this.roleModel.findOne({ name: 'Staff' });
            if (!existingStaffRole) {
                const staffRole = new this.roleModel({
                    name: 'Staff',
                    description: 'Staff role with administrative and support permissions',
                    permissions: [
                        {
                            name: 'student_read',
                            description: 'Read student information',
                            module: 'students',
                            action: 'read'
                        },
                        {
                            name: 'user_manage',
                            description: 'Manage users and accounts',
                            module: 'users',
                            action: 'manage'
                        },
                        {
                            name: 'certificate_approve',
                            description: 'Approve or reject certificates',
                            module: 'certificates',
                            action: 'approve'
                        },
                        {
                            name: 'document_approve',
                            description: 'Approve or reject documents',
                            module: 'documents',
                            action: 'approve'
                        },
                        {
                            name: 'reports_generate',
                            description: 'Generate and export reports',
                            module: 'reports',
                            action: 'write'
                        },
                        {
                            name: 'system_settings',
                            description: 'Access system settings',
                            module: 'settings',
                            action: 'read'
                        }
                    ],
                    isDefault: false
                });
                await staffRole.save();
                console.log('Staff role created with staff permissions');
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