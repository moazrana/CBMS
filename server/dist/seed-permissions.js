"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const permissions_seeder_1 = require("./src/users/seeders/permissions.seeder");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        console.log('Starting permissions seeding...');
        const seeder = app.get(permissions_seeder_1.PermissionsSeeder);
        await seeder.seed();
        console.log('Permissions seeding completed successfully');
    }
    catch (error) {
        console.error('Error seeding permissions:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-permissions.js.map