import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeedPermissionsCommand } from './users/seeders/seed-permissions.command';
import { PermissionsSeeder } from './users/seeders/permissions.seeder';
import { RolesSeeder } from './users/seeders/roles.seeder';
import { Permission, PermissionSchema } from './users/schemas/permission.schema';
import { Role, RoleSchema } from './users/schemas/role.schema';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CertificatesModule } from './certificates/certificates.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-here',
          MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cbms',
          PORT: process.env.PORT || 3000,
        }),
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CertificatesModule,
  ],
  providers: [SeedPermissionsCommand, PermissionsSeeder, RolesSeeder],
})
export class AppModule {} 