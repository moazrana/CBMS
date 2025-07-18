"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const roles_controller_1 = require("./roles.controller");
const roles_service_1 = require("./services/roles.service");
const role_permission_service_1 = require("./services/role-permission.service");
const role_schema_1 = require("./schemas/role.schema");
const permission_schema_1 = require("../permissions/schemas/permission.schema");
let RolesModule = class RolesModule {
};
exports.RolesModule = RolesModule;
exports.RolesModule = RolesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema }
            ]),
        ],
        controllers: [roles_controller_1.RolesController],
        providers: [roles_service_1.RolesService, role_permission_service_1.RolePermissionService],
        exports: [roles_service_1.RolesService, role_permission_service_1.RolePermissionService],
    })
], RolesModule);
//# sourceMappingURL=roles.module.js.map