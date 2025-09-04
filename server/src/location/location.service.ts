import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from './location.schema';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>
  ) {}

  async create(data: Partial<Location>): Promise<Location> {
    const created = new this.locationModel(data);
    return created.save();
  }

  async findAll(): Promise<Location[]> {
    return this.locationModel.find().exec();
  }

  async findOne(id: string): Promise<Location> {
    const found = await this.locationModel.findById(id).exec();
    if (!found) throw new NotFoundException('Location not found');
    return found;
  }

  async update(id: string, data: Partial<Location>): Promise<Location> {
    const updated = await this.locationModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.locationModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Location not found');
  }
} 