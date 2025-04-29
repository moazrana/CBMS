"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_schema_1 = require("./schemas/user.schema");
const role_schema_1 = require("./schemas/role.schema");
const role_permission_service_1 = require("./services/role-permission.service");
const roles_service_1 = require("./services/roles.service");
const roles_controller_1 = require("./controllers/roles.controller");
const permission_schema_1 = require("./schemas/permission.schema");
const permissions_seeder_1 = require("./seeders/permissions.seeder");
const seed_permissions_command_1 = require("./seeders/seed-permissions.command");
const roles_module_1 = require("../roles/roles.module");
const roles_guard_1 = require("../auth/guards/roles.guard");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
            ]),
            roles_module_1.RolesModule
        ],
        controllers: [users_controller_1.UsersController, roles_controller_1.RolesController],
        providers: [
            users_service_1.UsersService,
            role_permission_service_1.RolePermissionService,
            roles_service_1.RolesService,
            permissions_seeder_1.PermissionsSeeder,
            seed_permissions_command_1.SeedPermissionsCommand,
            roles_guard_1.RolesGuard
        ],
        exports: [users_service_1.UsersService, role_permission_service_1.RolePermissionService, roles_service_1.RolesService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map