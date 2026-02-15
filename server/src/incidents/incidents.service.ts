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
      bodyMapFrontMarkers,
      bodyMapBackMarkers,
      early_help,
      referral_type,
      meeting_notes,
      outcome,
      fileName,
      filePath,
      fileType,
      fileSize,
      descriptionFiles,
      restrainFiles,
      meetings,
      conclusion,
      directedToward,
      physicalInterventionUsed,
      restrainDescription,
      action,
      actionDescription,
      exclusion,
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
      bodyMapFrontMarkers: bodyMapFrontMarkers ?? {},
      bodyMapBackMarkers: bodyMapBackMarkers ?? {},
      early_help,
      referral_type,
      meeting_notes,
      outcome,
      fileName,
      filePath,
      fileType,
      fileSize,
      descriptionFiles: descriptionFiles ?? [],
      restrainFiles: restrainFiles ?? [],
      meetings,
      conclusion,
      directedToward: directedToward ?? [],
      physicalInterventionUsed: physicalInterventionUsed ?? false,
      restrainDescription,
      action: action ?? [],
      actionDescription,
      exclusion: exclusion ?? [],
    });
    return created.save();
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentModel.find()
      .sort({ createdAt: -1 })
      .populate([
      { path: 'student', select: 'personalInfo' },
      { path: 'staff', select: 'name profile' },
      { path: 'period', select: 'name' },
    ])
      .exec();
  }

  async findOne(id: string): Promise<Incident> {
    const found = await this.incidentModel
      .findById(id)
      .populate({ path: 'student', select: 'personalInfo' })
      .populate({ path: 'staff', select: 'name profile' })
      .populate('period')
      .exec();
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