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
const role_schema_1 = require("../roles/schemas/role.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const roles_seeder_1 = require("./roles.seeder");
const users_seeder_1 = require("./users.seeder");
const seeder_service_1 = require("./seeder.service");
const seed_command_1 = require("./seed.command");
const permissions_seeder_1 = require("./permissions.seeder");
const permission_schema_1 = require("../permissions/schemas/permission.schema");
let SeederModule = class SeederModule {
};
exports.SeederModule = SeederModule;
exports.SeederModule = SeederModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/cbms'),
            mongoose_1.MongooseModule.forFeature([
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
            ]),
        ],
        providers: [permissions_seeder_1.PermissionsSeeder, seeder_service_1.SeederService, roles_seeder_1.RolesSeeder, users_seeder_1.UsersSeeder, seed_command_1.SeedCommand],
        exports: [seeder_service_1.SeederService],
    })
], SeederModule);
//# sourceMappingURL=seeder.module.js.map