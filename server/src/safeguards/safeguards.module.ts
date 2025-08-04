import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SafeguardsController } from './safeguards.controller';
import { SafeguardsService } from './safeguards.service';
import { Safeguard, SafeguardSchema } from './schemas/safeguard.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { LocationModule } from '../location/location.module';
import { PeriodModule } from '../period/period.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Safeguard.name, schema: SafeguardSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LocationModule,
    PeriodModule,
  ],
  controllers: [SafeguardsController],
  providers: [SafeguardsService],
  exports: [SafeguardsService],
})
export class SafeguardsModule {} 