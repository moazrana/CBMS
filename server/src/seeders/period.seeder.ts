import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Period } from '../period/period.schema';

@Injectable()
export class PeriodSeeder {
  constructor(
    @InjectModel(Period.name) private periodModel: Model<Period>
  ) {}

  async seed() {
    const periods = [
      { name: 'Breakfast Club', startTime: '09:30', endTime: '10:00' },
      { name: 'Breakfast Club (AM Reg)', startTime: '10:00', endTime: '10:15' },
      { name: 'Achieve Training', startTime: '10:15', endTime: '11:15' },
      { name: 'Stanley House', startTime: '11:30', endTime: '12:30' },
      { name: 'Session 3 - 13.00 - 14.00', startTime: '13:00', endTime: '14:00' },
    ];
    for (const period of periods) {
      const exists = await this.periodModel.findOne({ name: period.name });
      if (!exists) {
        await this.periodModel.create(period);
      } else {
        await this.periodModel.updateOne(
          { name: period.name },
          { $set: { startTime: period.startTime, endTime: period.endTime } },
        );
      }
    }
    return 'Periods seeded';
  }
} 