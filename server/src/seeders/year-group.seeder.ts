import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { YearGroup } from '../year-group/year-group.schema';

@Injectable()
export class YearGroupSeeder {
  constructor(
    @InjectModel(YearGroup.name) private yearGroupModel: Model<YearGroup>,
  ) {}

  async seed() {
    const names = [
      'Reception',
      'Year 1',
      'Year 2',
      'Year 3',
      'Year 4',
      'Year 5',
      'Year 6',
      'Year 7',
      'Year 8',
      'Year 9',
      'Year 10',
      'Year 11',
      'Year 12',
      'Year 13',
      'All',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
    ];
    for (const name of names) {
      const exists = await this.yearGroupModel.findOne({ name });
      if (!exists) {
        await this.yearGroupModel.create({ name });
      }
    }
    return 'Year groups seeded';
  }
}
