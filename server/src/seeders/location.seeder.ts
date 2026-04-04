import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from '../location/location.schema';

@Injectable()
export class LocationSeeder {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<Location>
  ) {}

  async seed() {
    const locations = [
      { name: 'Warrington' },
      { name: 'Bury' },
    ];
    await this.locationModel.deleteMany({});
    for (const loc of locations) {
      await this.locationModel.create(loc);
    }
    return 'Locations seeded';
  }
} 