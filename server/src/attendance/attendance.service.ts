import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Check if an attendance record with same student, date, class, staff, and period exists
    const existingAttendance = await this.attendanceModel.findOne({
      student: new Types.ObjectId(createAttendanceDto.student),
      date: new Date(createAttendanceDto.date),
      class: new Types.ObjectId(createAttendanceDto.class),
      staff: new Types.ObjectId(createAttendanceDto.staff),
      period: new Types.ObjectId(createAttendanceDto.period),
    });

    if (existingAttendance) {
      // Update the existing record with new data
      Object.assign(existingAttendance, {
        ...createAttendanceDto,
        student: new Types.ObjectId(createAttendanceDto.student),
        class: new Types.ObjectId(createAttendanceDto.class),
        period: new Types.ObjectId(createAttendanceDto.period),
        staff: new Types.ObjectId(createAttendanceDto.staff),
        date: new Date(createAttendanceDto.date),
      });
      return existingAttendance.save();
    }
    const attendanceData = {
      ...createAttendanceDto,
      student: new Types.ObjectId(createAttendanceDto.student),
      class: new Types.ObjectId(createAttendanceDto.class),
      period: new Types.ObjectId(createAttendanceDto.period),
      staff: new Types.ObjectId(createAttendanceDto.staff),
      date: new Date(createAttendanceDto.date),
    };

    const createdAttendance = new this.attendanceModel(attendanceData);
    return createdAttendance.save();
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceModel
      .find()
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceModel
      .findById(id)
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const updateData: any = { ...updateAttendanceDto };

    // Convert string IDs to ObjectIds if provided
    if (updateAttendanceDto.student) {
      updateData.student = new Types.ObjectId(updateAttendanceDto.student);
    }
    if (updateAttendanceDto.class) {
      updateData.class = new Types.ObjectId(updateAttendanceDto.class);
    }
    if (updateAttendanceDto.period) {
      updateData.period = new Types.ObjectId(updateAttendanceDto.period);
    }
    if (updateAttendanceDto.staff) {
      updateData.staff = new Types.ObjectId(updateAttendanceDto.staff);
    }
    if (updateAttendanceDto.date) {
      updateData.date = new Date(updateAttendanceDto.date);
    }

    const updatedAttendance = await this.attendanceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();

    if (!updatedAttendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return updatedAttendance;
  }

  async remove(id: string): Promise<void> {
    const result = await this.attendanceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async findByClass(classId: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({ class: new Types.ObjectId(classId) })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async findByStaff(staffId: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({ staff: new Types.ObjectId(staffId) })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async findByDate(date: string): Promise<Attendance[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async findByStudentAndDate(studentId: string, date: string): Promise<Attendance[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({
        student: new Types.ObjectId(studentId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async findByClassAndDate(classId: string, date: string): Promise<Attendance[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({
        class: new Types.ObjectId(classId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('student', 'name email role')
      .populate('class', 'name')
      .populate('period', 'name')
      .populate('staff', 'name email role')
      .exec();
  }

  async getMonthlyAttendanceStats(year?: number): Promise<any[]> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const monthlyStats = await this.attendanceModel.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          stats: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const result = monthNames.map((monthName, index) => {
      const monthData = monthlyStats.find(stat => stat._id === index + 1);
      
      let attended = 0;
      let absent = 0;
      let total = 0;

      if (monthData) {
        monthData.stats.forEach((stat: any) => {
          if (stat.status === "present" || stat.status === "attended") {
            attended += stat.count;
          } else if (stat.status === "absent") {
            absent += stat.count;
          }
          total += stat.count;
        });
      }

      const attendedPercentage = total > 0 ? Math.round((attended / total) * 100) : 0;
      const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0;



      return {
        month: monthName,
        present: attendedPercentage,
        absent: absentPercentage,
      };
    });

    return result;
  }

}
