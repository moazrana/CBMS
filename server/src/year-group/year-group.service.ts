import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { YearGroup, YearGroupDocument } from './year-group.schema';

@Injectable()
export class YearGroupService {
  constructor(
    @InjectModel(YearGroup.name) private yearGroupModel: Model<YearGroupDocument>,
  ) {}

  async create(data: { name: string }): Promise<YearGroup> {
    const created = new this.yearGroupModel(data);
    return created.save();
  }

  async findAll(): Promise<YearGroup[]> {
    return this.yearGroupModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<YearGroup> {
    const found = await this.yearGroupModel.findById(id).exec();
    if (!found) throw new NotFoundException('Year group not found');
    return found;
  }

  async update(id: string, data: { name?: string }): Promise<YearGroup> {
    const updated = await this.yearGroupModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Year group not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.yearGroupModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Year group not found');
  }
}
