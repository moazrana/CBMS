import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';
import { Engagement, EngagementSchema } from './engagement.schema';
import { Class, ClassSchema } from '../class/class.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Engagement.name, schema: EngagementSchema },
      { name: Class.name, schema: ClassSchema },
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

