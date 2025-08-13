"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const role_schema_1 = require("../users/schemas/role.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const permission_schema_1 = require("../users/schemas/permission.schema");
const location_schema_1 = require("../location/location.schema");
const period_schema_1 = require("../period/period.schema");
const roles_seeder_1 = require("./roles.seeder");
const users_seeder_1 = require("./users.seeder");
const seeder_service_1 = require("./seeder.service");
const seed_command_1 = require("./seed.command");
const permissions_seeder_1 = require("./permissions.seeder");
const dashboard_permission_seeder_1 = require("./dashboard-permission.seeder");
const role_permissions_seeder_1 = require("./role-permissions.seeder");
const safeguarding_permissions_seeder_1 = require("./safeguarding-permissions.seeder");
const incidents_permissions_seeder_1 = require("./incidents-permissions.seeder");
const safeguarding_permissions_seed_command_1 = require("./safeguarding-permissions-seed.command");
const incidents_permissions_seed_command_1 = require("./incidents-permissions-seed.command");
const location_seeder_1 = require("./location.seeder");
const period_seeder_1 = require("./period.seeder");
const teacher_seeder_1 = require("./teacher.seeder");
const student_seeder_1 = require("./student.seeder");
const staff_seeder_1 = require("./staff.seeder");
const student_seed_command_1 = require("./student-seed.command");
const staff_seed_command_1 = require("./staff-seed.command");
let SeederModule = class SeederModule {
};
exports.SeederModule = SeederModule;
exports.SeederModule = SeederModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cbms'),
            mongoose_1.MongooseModule.forFeature([
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
                { name: location_schema_1.Location.name, schema: location_schema_1.LocationSchema },
                { name: period_schema_1.Period.name, schema: period_schema_1.PeriodSchema },
            ]),
        ],
        providers: [
            permissions_seeder_1.PermissionsSeeder,
            dashboard_permission_seeder_1.DashboardPermissionSeeder,
            role_permissions_seeder_1.RolePermissionsSeeder,
            safeguarding_permissions_seeder_1.SafeguardingPermissionsSeeder,
            incidents_permissions_seeder_1.IncidentsPermissionsSeeder,
            safeguarding_permissions_seed_command_1.SafeguardingPermissionsSeedCommand,
            incidents_permissions_seed_command_1.IncidentsPermissionsSeedCommand,
            location_seeder_1.LocationSeeder,
            period_seeder_1.PeriodSeeder,
            seeder_service_1.SeederService,
            roles_seeder_1.RolesSeeder,
            users_seeder_1.UsersSeeder,
            seed_command_1.SeedCommand,
            teacher_seeder_1.TeacherSeeder,
            student_seeder_1.StudentSeeder,
            staff_seeder_1.StaffSeeder,
            student_seed_command_1.StudentSeedCommand,
            staff_seed_command_1.StaffSeedCommand
        ],
        exports: [seeder_service_1.SeederService, teacher_seeder_1.TeacherSeeder, student_seeder_1.StudentSeeder, staff_seeder_1.StaffSeeder],
    })
], SeederModule);
//# sourceMappingURL=seeder.module.js.map