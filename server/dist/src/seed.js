"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const seeder_module_1 = require("./seeders/seeder.module");
const seeder_service_1 = require("./seeders/seeder.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(seeder_module_1.SeederModule);
    const seederService = app.get(seeder_service_1.SeederService);
    await seederService.seed();
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map