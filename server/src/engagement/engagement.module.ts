import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';
import { Engagement, EngagementSchema } from './engagement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Engagement.name, schema: EngagementSchema }
    ])
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService]
})
export class EngagementModule {}

