"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const roles_seeder_1 = require("./src/seeders/roles.seeder");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        console.log('Starting roles seeding...');
        const seeder = app.get(roles_seeder_1.RolesSeeder);
        await seeder.seed();
        console.log('Roles seeding completed successfully');
    }
    catch (error) {
        console.error('Error seeding roles:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-roles.js.map