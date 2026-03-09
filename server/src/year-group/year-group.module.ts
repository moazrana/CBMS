import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  YearGroup,
  YearGroupSchema,
} from './year-group.schema';
import { YearGroupService } from './year-group.service';
import { YearGroupController } from './year-group.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YearGroup.name, schema: YearGroupSchema },
    ]),
  ],
  controllers: [YearGroupController],
  providers: [YearGroupService],
  exports: [YearGroupService],
})
export class YearGroupModule {}
