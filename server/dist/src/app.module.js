"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const seed_permissions_command_1 = require("./users/seeders/seed-permissions.command");
const permissions_seeder_1 = require("./users/seeders/permissions.seeder");
const roles_seeder_1 = require("./users/seeders/roles.seeder");
const permission_schema_1 = require("./users/schemas/permission.schema");
const role_schema_1 = require("./users/schemas/role.schema");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const certificates_module_1 = require("./certificates/certificates.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    () => ({
                        JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-here',
                        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cbms',
                        PORT: process.env.PORT || 3000,
                    }),
                ],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            certificates_module_1.CertificatesModule,
        ],
        providers: [seed_permissions_command_1.SeedPermissionsCommand, permissions_seeder_1.PermissionsSeeder, roles_seeder_1.RolesSeeder],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map