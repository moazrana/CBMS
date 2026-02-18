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
      students,
      staffList,
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
      bodyMapDescriptions,
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
      involved,
      physicalInterventionUsed,
      restrainDescription,
      action,
      actionDescription,
      actionOthersDescription,
      exclusion,
      exclusionOthersDescription,
      earlyHelpOthersDescription,
      referralOthersDescription,
      outcomeAttachmentNote,
    } = data;

    let number = data.number;
    if (number == null || number === undefined) {
      const last = await this.incidentModel.findOne().sort({ number: -1 }).select('number').lean().exec();
      number = (last?.number ?? 0) + 1;
    }

    const created = new this.incidentModel({
      number,
      students: students ?? [],
      staffList: staffList ?? [],
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
      bodyMapDescriptions: bodyMapDescriptions ?? {},
      early_help,
      earlyHelpOthersDescription,
      referral_type,
      referralOthersDescription,
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
      outcomeAttachmentNote,
      directedToward: directedToward ?? [],
      involved: involved ?? [],
      physicalInterventionUsed: physicalInterventionUsed ?? false,
      restrainDescription,
      action: action ?? [],
      actionDescription,
      actionOthersDescription,
      exclusion: exclusion ?? [],
      exclusionOthersDescription,
    });
    return created.save();
  }

  async findAll(): Promise<Incident[]> {
    const list = await this.incidentModel
      .find()
      .sort({ createdAt: -1 })
      .populate([
        { path: 'student', select: 'personalInfo' },
        { path: 'staff', select: 'name profile' },
        { path: 'students', select: 'personalInfo' },
        { path: 'staffList', select: 'name profile' },
        { path: 'period', select: 'name' },
      ])
      .exec();
    return list.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      if (!obj.students?.length && obj.student) obj.students = [obj.student];
      if (!obj.staffList?.length && obj.staff) obj.staffList = [obj.staff];
      return obj as Incident;
    });
  }

  async findByStudentId(studentId: string): Promise<Incident[]> {
    const list = await this.incidentModel
      .find({
        $or: [
          { students: studentId },
          { student: studentId },
        ],
      })
      .sort({ createdAt: -1 })
      .populate({ path: 'students', select: 'personalInfo' })
      .populate({ path: 'staffList', select: 'name profile' })
      .populate('period')
      .exec();
    return list.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      if (!obj.students?.length && obj.student) obj.students = [obj.student];
      if (!obj.staffList?.length && obj.staff) obj.staffList = [obj.staff];
      return obj as Incident;
    });
  }

  async findByStaffId(staffId: string): Promise<Incident[]> {
    const list = await this.incidentModel
      .find({
        $or: [
          { staffList: staffId },
          { staff: staffId },
        ],
      })
      .sort({ createdAt: -1 })
      .populate({ path: 'students', select: 'personalInfo' })
      .populate({ path: 'staffList', select: 'name profile' })
      .populate('period')
      .exec();
    return list.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      if (!obj.students?.length && obj.student) obj.students = [obj.student];
      if (!obj.staffList?.length && obj.staff) obj.staffList = [obj.staff];
      return obj as Incident;
    });
  }

  async findOne(id: string): Promise<Incident> {
    const found = await this.incidentModel
      .findById(id)
      .populate({ path: 'student', select: 'personalInfo' })
      .populate({ path: 'staff', select: 'name profile' })
      .populate({ path: 'students', select: 'personalInfo' })
      .populate({ path: 'staffList', select: 'name profile' })
      .populate('period')
      .exec();
    if (!found) throw new NotFoundException('Incident not found');
    const obj = found.toObject ? found.toObject() : found;
    if (!obj.students?.length && obj.student) obj.students = [obj.student];
    if (!obj.staffList?.length && obj.staff) obj.staffList = [obj.staff];
    return obj as Incident;
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    const updated = await this.incidentModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate({ path: 'students', select: 'personalInfo' })
      .populate({ path: 'staffList', select: 'name profile' })
      .exec();
    if (!updated) throw new NotFoundException('Incident not found');
    const obj = updated.toObject ? updated.toObject() : updated;
    if (!obj.students?.length && obj.student) obj.students = [obj.student];
    if (!obj.staffList?.length && obj.staff) obj.staffList = [obj.staff];
    return obj as Incident;
  }

  async remove(id: string): Promise<void> {
    const res = await this.incidentModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Incident not found');
  }
} 