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
      { name: 'Achieve Warrington' },
      { name: 'Training - Motor Vehicle' },
      { name: 'Training - Common Room' },
      { name: 'Training - Classroom' },
      { name: 'Training - Office' },
      { name: 'Off-Site' },
      { name: 'N/A' },
    ];
    for (const loc of locations) {
      const exists = await this.locationModel.findOne({ name: loc.name });
      if (!exists) {
        await this.locationModel.create(loc);
      }
    }
    return 'Locations seeded';
  }
} 