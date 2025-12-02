import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Permission, PermissionSchema } from './users/schemas/permission.schema';
import { Role, RoleSchema } from './users/schemas/role.schema';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CertificatesModule } from './certificates/certificates.module';
// import { MailService } from './services/mail.service';
import { TestModule } from './test/test.module';
import { SafeguardsModule } from './safeguards/safeguards.module';
import { IncidentsModule } from './incidents/incidents.module';
import { LocationModule } from './location/location.module';
import { PeriodModule } from './period/period.module';
import { ClassModule } from './class/class.module';
import { StaffModule } from './staff/staff.module';
import { AttendanceModule } from './attendance/attendance.module';
import { StudentsModule } from './students/students.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-here',
          MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cbms',
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
    TestModule,
    SafeguardsModule,
    IncidentsModule,
    LocationModule,
    PeriodModule,
    ClassModule,
    StaffModule,
    AttendanceModule,
    StudentsModule,
  ],
  providers: [
    // MailService
  ],
})
export class AppModule {} 