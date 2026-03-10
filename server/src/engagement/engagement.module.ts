import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';
import { Engagement, EngagementSchema } from './engagement.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Engagement.name, schema: EngagementSchema }
    ]),
    AuthModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService]
})
export class EngagementModule {}

