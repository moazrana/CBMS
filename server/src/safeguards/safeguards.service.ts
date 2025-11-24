import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Safeguard, SafeguardDocument } from './schemas/safeguard.schema';

@Injectable()
export class SafeguardsService {
  constructor(
    @InjectModel(Safeguard.name) private safeguardModel: Model<SafeguardDocument>
  ) {}

  async create(data: Partial<Safeguard>): Promise<Safeguard> {
    const {
      student,
      staff,
      status,
      location,
      dateAndTime,
      period,
      description,
      commentary,
      type,
      your_account,
      body_mapping,
      early_help,
      referral_type,
      meeting_notes,
      outcome,
      fileName,
      filePath,
      fileType,
      fileSize,
      meetings,
      conclusion
    } = data;

    const created = new this.safeguardModel({
      student,
      staff,
      status,
      location,
      dateAndTime,
      period,
      description,
      commentary,
      type,
      your_account,
      body_mapping,
      early_help,
      referral_type,
      meeting_notes,
      outcome,
      fileName,
      filePath,
      fileType,
      fileSize,
      meetings,
      conclusion
    });
    return created.save();
  }

  async findAll(): Promise<Safeguard[]> {
    return this.safeguardModel.find().populate([
      {path:'student',select:'name subject'}, 
      {path:'staff',select:'name'}, 
      {path:'location',select:'name'}, 
      {path:'period',select:'name'}
    ]).exec();
  }

  async findOne(id: string): Promise<Safeguard> {
    if (!id || id === 'undefined' || id === 'null' || !id.trim()) {
      throw new NotFoundException('Safeguard ID is required');
    }
    const found = await this.safeguardModel.findById(id).populate('student staff location period').exec();
    if (!found) throw new NotFoundException('Safeguard not found');
    return found;
  }

  async update(id: string, data: Partial<Safeguard>): Promise<Safeguard> {
    const updated = await this.safeguardModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Safeguard not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.safeguardModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Safeguard not found');
  }
} 