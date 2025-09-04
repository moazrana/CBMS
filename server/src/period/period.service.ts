import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Period, PeriodDocument } from './period.schema';

@Injectable()
export class PeriodService {
  constructor(
    @InjectModel(Period.name) private periodModel: Model<PeriodDocument>
  ) {}

  async create(data: Partial<Period>): Promise<Period> {
    const created = new this.periodModel(data);
    return created.save();
  }

  async findAll(): Promise<Period[]> {
    return this.periodModel.find().exec();
  }

  async findOne(id: string): Promise<Period> {
    const found = await this.periodModel.findById(id).exec();
    if (!found) throw new NotFoundException('Period not found');
    return found;
  }

  async update(id: string, data: Partial<Period>): Promise<Period> {
    const updated = await this.periodModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Period not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.periodModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Period not found');
  }
} 