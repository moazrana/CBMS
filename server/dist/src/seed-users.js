"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const seeder_module_1 = require("./seeders/seeder.module");
const users_seeder_1 = require("./seeders/users.seeder");
async function bootstrap() {
    const app = await core_1.NestFactory.create(seeder_module_1.SeederModule);
    const usersSeeder = app.get(users_seeder_1.UsersSeeder);
    await usersSeeder.seed();
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed-users.js.map