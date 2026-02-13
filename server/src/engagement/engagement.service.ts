import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Engagement, EngagementDocument } from './engagement.schema';
import { CreateEngagementDto } from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';

@Injectable()
export class EngagementService {
  constructor(
    @InjectModel(Engagement.name) private engagementModel: Model<EngagementDocument>,
  ) {}

  async create(createEngagementDto: CreateEngagementDto): Promise<Engagement> {
    const createdEngagement = new this.engagementModel(createEngagementDto);
    return createdEngagement.save();
  }

  async findAll(
    sort: string = 'createdAt',
    order: string = 'DESC',
    search: string = '',
    page: number = 1,
    perPage: number = 10,
  ): Promise<Engagement[]> {
    const sortOrder = order === 'DESC' ? -1 : 1;
    const query = this.engagementModel.find();
    
    if (search) {
      query.where({
        $or: [
          { comment: { $regex: search, $options: 'i' } },
        ],
      });
    }
    
    return query
      .sort({ [sort]: sortOrder })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .exec();
  }

  async findOne(id: string): Promise<Engagement> {
    const engagement = await this.engagementModel
      .findById(id)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .exec();

    if (!engagement) {
      throw new NotFoundException(`Engagement with ID ${id} not found`);
    }
    return engagement;
  }

  async update(id: string, updateEngagementDto: UpdateEngagementDto): Promise<Engagement> {
    const updatedEngagement = await this.engagementModel
      .findByIdAndUpdate(id, updateEngagementDto, { new: true })
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .exec();

    if (!updatedEngagement) {
      throw new NotFoundException(`Engagement with ID ${id} not found`);
    }
    return updatedEngagement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.engagementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Engagement with ID ${id} not found`);
    }
  }

  async findByClass(classId: string, engagementDate?: string): Promise<Engagement[]> {
    const query: any = { class: classId };
    
    if (engagementDate) {
      // Convert date string to start and end of day for proper date comparison
      const startOfDay = new Date(engagementDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(engagementDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.engagementDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
    
    return this.engagementModel
      .find(query)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStudent(studentId: string): Promise<Engagement[]> {
    return this.engagementModel
      .find({ student: studentId })
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByClassAndStudent(classId: string, studentId: string): Promise<Engagement[]> {
    return this.engagementModel
      .find({ class: classId, student: studentId })
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByClassStudentAndSession(
    classId: string,
    studentId: string,
    session: string,
    engagementDate?: string,
  ): Promise<Engagement | null> {
    const query: any = { class: classId, student: studentId, session };
    
    if (engagementDate) {
      // Convert date string to start and end of day for proper date comparison
      const startOfDay = new Date(engagementDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(engagementDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.engagementDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
    
    return this.engagementModel
      .findOne(query)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .exec();
  }

  /** Set submitted=true for all engagements of this student in this class on this date */
  async submitEngagementsForStudent(
    classId: string,
    studentId: string,
    engagementDate: string,
  ): Promise<{ count: number }> {
    const startOfDay = new Date(engagementDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(engagementDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.engagementModel
      .updateMany(
        {
          class: classId,
          student: studentId,
          engagementDate: { $gte: startOfDay, $lte: endOfDay },
        },
        { $set: { submitted: true } },
      )
      .exec();

    return { count: result.matchedCount };
  }

  /** Filter engagements to those visible in "marked engagements": submitted or all 6 sessions present for that student/class/date */
  private filterToMarkedVisible(engagements: EngagementDocument[]): EngagementDocument[] {
    const SESSION_COUNT = 6;
    const dateStr = (d: Date | string) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
    const key = (e: EngagementDocument) =>
      `${e.class}|${e.student}|${dateStr(e.engagementDate as Date)}`;
    const byKey = new Map<string, EngagementDocument[]>();
    engagements.forEach((e) => {
      const k = key(e);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k)!.push(e);
    });
    const includeKeys = new Set<string>();
    byKey.forEach((list, k) => {
      const anySubmitted = list.some((e) => e.submitted === true);
      if (anySubmitted || list.length >= SESSION_COUNT) includeKeys.add(k);
    });
    return engagements.filter((e) => includeKeys.has(key(e)));
  }

  async findMarkedEngagements(
    sort: string = 'createdAt',
    order: string = 'DESC',
    page: number = 1,
    perPage: number = 500,
  ): Promise<Engagement[]> {
    const sortOrder = order === 'DESC' ? -1 : 1;
    const all = await this.engagementModel
      .find()
      .sort({ [sort]: sortOrder })
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .exec();
    const filtered = this.filterToMarkedVisible(all);
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }

  async findByClassMarked(classId: string, engagementDate?: string): Promise<Engagement[]> {
    const query: any = { class: classId };
    if (engagementDate) {
      const startOfDay = new Date(engagementDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(engagementDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.engagementDate = { $gte: startOfDay, $lte: endOfDay };
    }
    const all = await this.engagementModel
      .find(query)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup' })
      .populate({ path: 'student', model: 'Student', select: 'personalInfo' })
      .sort({ createdAt: -1 })
      .exec();
    return this.filterToMarkedVisible(all);
  }
}

