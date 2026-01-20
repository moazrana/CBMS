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
      .populate('class')
      .populate('student')
      .exec();
  }

  async findOne(id: string): Promise<Engagement> {
    const engagement = await this.engagementModel
      .findById(id)
      .populate('class')
      .populate('student')
      .exec();

    if (!engagement) {
      throw new NotFoundException(`Engagement with ID ${id} not found`);
    }
    return engagement;
  }

  async update(id: string, updateEngagementDto: UpdateEngagementDto): Promise<Engagement> {
    const updatedEngagement = await this.engagementModel
      .findByIdAndUpdate(id, updateEngagementDto, { new: true })
      .populate('class')
      .populate('student')
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
      .populate('class')
      .populate('student')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStudent(studentId: string): Promise<Engagement[]> {
    return this.engagementModel
      .find({ student: studentId })
      .populate('class')
      .populate('student')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByClassAndStudent(classId: string, studentId: string): Promise<Engagement[]> {
    return this.engagementModel
      .find({ class: classId, student: studentId })
      .populate('class')
      .populate('student')
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
      .populate('class')
      .populate('student')
      .exec();
  }
}

