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
      { name: 'Breakfast Club' },
      { name: 'Achieve Training' },
      { name: 'Stanley House' },
      { name: 'Breakfast Club (AM Reg)' },
      { name: 'Session 3 - 13.00 - 14.00' },
    ];
    for (const period of periods) {
      const exists = await this.periodModel.findOne({ name: period.name });
      if (!exists) {
        await this.periodModel.create(period);
      }
    }
    return 'Periods seeded';
  }
} 