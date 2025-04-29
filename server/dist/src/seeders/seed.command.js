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
exports.SeedCommand = void 0;
const nest_commander_1 = require("nest-commander");
const seeder_service_1 = require("./seeder.service");
let SeedCommand = class SeedCommand extends nest_commander_1.CommandRunner {
    constructor(seederService) {
        super();
        this.seederService = seederService;
    }
    async run() {
        try {
            await this.seederService.seed();
        }
        catch (error) {
            console.error('Error running seed command:', error);
            process.exit(1);
        }
    }
};
exports.SeedCommand = SeedCommand;
exports.SeedCommand = SeedCommand = __decorate([
    (0, nest_commander_1.Command)({
        name: 'seed',
        description: 'Seed the database with initial data',
    }),
    __metadata("design:paramtypes", [seeder_service_1.SeederService])
], SeedCommand);
//# sourceMappingURL=seed.command.js.map