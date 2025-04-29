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
exports.SeedPermissionsCommand = void 0;
const nest_commander_1 = require("nest-commander");
const permissions_seeder_1 = require("./permissions.seeder");
let SeedPermissionsCommand = class SeedPermissionsCommand extends nest_commander_1.CommandRunner {
    constructor(permissionsSeeder) {
        super();
        this.permissionsSeeder = permissionsSeeder;
    }
    async run() {
        try {
            console.log('Starting permissions seeding...');
            const result = await this.permissionsSeeder.seed();
            if (result) {
                console.log('Permissions seeding completed successfully');
            }
            else {
                console.error('Permissions seeding failed');
            }
        }
        catch (error) {
            console.error('Error running permissions seeder:', error);
        }
    }
};
exports.SeedPermissionsCommand = SeedPermissionsCommand;
exports.SeedPermissionsCommand = SeedPermissionsCommand = __decorate([
    (0, nest_commander_1.Command)({
        name: 'seed:permissions',
        description: 'Seed permissions in the database',
    }),
    __metadata("design:paramtypes", [permissions_seeder_1.PermissionsSeeder])
], SeedPermissionsCommand);
//# sourceMappingURL=seed-permissions.command.js.map