import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const created = new this.scheduleModel(createScheduleDto);
    return created.save();
  }

  async createMany(dtos: CreateScheduleDto[]): Promise<Schedule[]> {
    if (!dtos.length) return [];
    const created = await this.scheduleModel.insertMany(dtos);
    return created as unknown as Schedule[];
  }

  async findAll(
    sort: string = 'createdAt',
    order: string = 'DESC',
    classId?: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<Schedule[]> {
    const sortOrder = order === 'DESC' ? -1 : 1;
    const query = this.scheduleModel.find();
    if (classId) {
      query.where({ class: classId });
    }
    return query
      .sort({ [sort]: sortOrder })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup fromDate toDate' })
      .populate({ path: 'period', model: 'Period', select: 'name startTime endTime' })
      .populate({ path: 'staff', model: 'User', select: 'name' })
      .populate({ path: 'teacher', model: 'User', select: 'name' })
      .exec();
  }

  async findByClass(classId: string): Promise<Schedule[]> {
    return this.scheduleModel
      .find({ class: classId })
      .sort({ day: 1 })
      .populate({ path: 'period', model: 'Period', select: 'name startTime endTime' })
      .populate({ path: 'staff', model: 'User', select: 'name' })
      .populate({ path: 'teacher', model: 'User', select: 'name' })
      .exec();
  }

  /** For timetable view: all schedules with class and period details, optionally filtered by class */
  async findForTimetable(classId?: string, perPage: number = 1000): Promise<Schedule[]> {
    const query = this.scheduleModel.find();
    if (classId) query.where({ class: classId });
    return query
      .sort({ day: 1 })
      .limit(perPage)
      .populate({ path: 'class', model: 'Class', select: 'location subject yeargroup fromDate toDate' })
      .populate({ path: 'period', model: 'Period', select: 'name startTime endTime' })
      .populate({ path: 'staff', model: 'User', select: 'name' })
      .populate({ path: 'teacher', model: 'User', select: 'name' })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate({ path: 'class', model: 'Class' })
      .populate({ path: 'period', model: 'Period' })
      .populate({ path: 'staff', model: 'User', select: 'name' })
      .populate({ path: 'teacher', model: 'User', select: 'name' })
      .exec();

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const updated = await this.scheduleModel
      .findByIdAndUpdate(id, updateScheduleDto, { new: true })
      .populate({ path: 'class', model: 'Class' })
      .populate({ path: 'period', model: 'Period' })
      .populate({ path: 'staff', model: 'User', select: 'name' })
      .populate({ path: 'teacher', model: 'User', select: 'name' })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.scheduleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }

  async removeByClass(classId: string): Promise<number> {
    const result = await this.scheduleModel.deleteMany({ class: classId }).exec();
    return result.deletedCount ?? 0;
  }
}
