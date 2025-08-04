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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederService = void 0;
const common_1 = require("@nestjs/common");
const roles_seeder_1 = require("./roles.seeder");
const users_seeder_1 = require("./users.seeder");
const permissions_seeder_1 = require("./permissions.seeder");
const dashboard_permission_seeder_1 = require("./dashboard-permission.seeder");
const role_permissions_seeder_1 = require("./role-permissions.seeder");
let SeederService = class SeederService {
    constructor(permissionsSeeder, dashboardPermissionSeeder, rolePermissionsSeeder, rolesSeeder, usersSeeder) {
        this.permissionsSeeder = permissionsSeeder;
        this.dashboardPermissionSeeder = dashboardPermissionSeeder;
        this.rolePermissionsSeeder = rolePermissionsSeeder;
        this.rolesSeeder = rolesSeeder;
        this.usersSeeder = usersSeeder;
    }
    async seed() {
        console.log('Starting all seeders...');
        await this.permissionsSeeder.seed();
        await this.dashboardPermissionSeeder.seed();
        await this.rolePermissionsSeeder.seed();
        await this.rolesSeeder.seed();
        await this.usersSeeder.seed();
        console.log('All seeders completed successfully!');
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permissions_seeder_1.PermissionsSeeder,
        dashboard_permission_seeder_1.DashboardPermissionSeeder,
        role_permissions_seeder_1.RolePermissionsSeeder,
        roles_seeder_1.RolesSeeder,
        users_seeder_1.UsersSeeder])
], SeederService);
//# sourceMappingURL=seeder.service.js.map