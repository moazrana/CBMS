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
const safeguarding_permissions_seeder_1 = require("./safeguarding-permissions.seeder");
const incidents_permissions_seeder_1 = require("./incidents-permissions.seeder");
const location_seeder_1 = require("./location.seeder");
const period_seeder_1 = require("./period.seeder");
const student_seeder_1 = require("./student.seeder");
const staff_seeder_1 = require("./staff.seeder");
let SeederService = class SeederService {
    constructor(permissionsSeeder, dashboardPermissionSeeder, rolePermissionsSeeder, safeguardingPermissionsSeeder, incidentsPermissionsSeeder, rolesSeeder, usersSeeder, locationSeeder, periodSeeder, studentSeeder, staffSeeder) {
        this.permissionsSeeder = permissionsSeeder;
        this.dashboardPermissionSeeder = dashboardPermissionSeeder;
        this.rolePermissionsSeeder = rolePermissionsSeeder;
        this.safeguardingPermissionsSeeder = safeguardingPermissionsSeeder;
        this.incidentsPermissionsSeeder = incidentsPermissionsSeeder;
        this.rolesSeeder = rolesSeeder;
        this.usersSeeder = usersSeeder;
        this.locationSeeder = locationSeeder;
        this.periodSeeder = periodSeeder;
        this.studentSeeder = studentSeeder;
        this.staffSeeder = staffSeeder;
    }
    async seed() {
        console.log('Starting all seeders...');
        await this.permissionsSeeder.seed();
        await this.dashboardPermissionSeeder.seed();
        await this.rolePermissionsSeeder.seed();
        await this.safeguardingPermissionsSeeder.seed();
        await this.incidentsPermissionsSeeder.seed();
        await this.rolesSeeder.seed();
        await this.usersSeeder.seed();
        await this.locationSeeder.seed();
        await this.periodSeeder.seed();
        await this.studentSeeder.seed();
        await this.staffSeeder.seed();
        console.log('All seeders completed successfully!');
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permissions_seeder_1.PermissionsSeeder,
        dashboard_permission_seeder_1.DashboardPermissionSeeder,
        role_permissions_seeder_1.RolePermissionsSeeder,
        safeguarding_permissions_seeder_1.SafeguardingPermissionsSeeder,
        incidents_permissions_seeder_1.IncidentsPermissionsSeeder,
        roles_seeder_1.RolesSeeder,
        users_seeder_1.UsersSeeder,
        location_seeder_1.LocationSeeder,
        period_seeder_1.PeriodSeeder,
        student_seeder_1.StudentSeeder,
        staff_seeder_1.StaffSeeder])
], SeederService);
//# sourceMappingURL=seeder.service.js.map