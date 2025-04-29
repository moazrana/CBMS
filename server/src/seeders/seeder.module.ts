import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { SeederService } from './seeder.service';
import { SeedCommand } from './seed.command';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/cbms'),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeederService, RolesSeeder, UsersSeeder, SeedCommand],
  exports: [SeederService],
})
export class SeederModule {} 