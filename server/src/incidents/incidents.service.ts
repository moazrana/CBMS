import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Incident, IncidentDocument } from './schemas/incident.schema';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private incidentModel: Model<IncidentDocument>
  ) {}

  async create(data: Partial<Incident>): Promise<Incident> {
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

    const created = new this.incidentModel({
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

  async findAll(): Promise<Incident[]> {
    return this.incidentModel.find().populate([
      {path:'student',select:'name subject'}, 
      {path:'staff',select:'name'}, 
      {path:'location',select:'name'}, 
      {path:'period',select:'name'}
    ]).exec();
  }

  async findOne(id: string): Promise<Incident> {
    const found = await this.incidentModel.findById(id).populate('student staff location period').exec();
    if (!found) throw new NotFoundException('Incident not found');
    return found;
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    const updated = await this.incidentModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Incident not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.incidentModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Incident not found');
  }
} 