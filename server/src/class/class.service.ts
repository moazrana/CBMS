import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { Class, ClassDocument } from './class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const createdClass = new this.classModel(createClassDto);
    return createdClass.save();
  }

  async findAll(): Promise<Class[]> {
    return this.classModel
      .find()
      .populate('students', 'name email role')
      .populate('staffs', 'name email role')
      .exec();
  }

  async findOne(id: string): Promise<Class> {
    const classData = await this.classModel
      .findById(id)
      .populate('students', 'name email role')
      .populate('staffs', 'name email role')
      .exec();

    if (!classData) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classData;
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const updatedClass = await this.classModel
      .findByIdAndUpdate(id, updateClassDto, { new: true })
      .populate('students', 'name email role')
      .populate('staffs', 'name email role')
      .exec();

    if (!updatedClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return updatedClass;
  }

  async remove(id: string): Promise<void> {
    const result = await this.classModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
  }

  async removeAll(): Promise<void> {
    await this.classModel.deleteMany({}).exec();
  }

  async addStudent(classId: string, studentId: string): Promise<Class> {
    const classData = await this.classModel.findById(classId);
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    if (classData.students.includes(new Schema.Types.ObjectId(studentId))) {
      throw new BadRequestException('Student is already in this class');
    }

    classData.students.push(new Schema.Types.ObjectId(studentId));
    return classData.save();
  }

  async removeStudent(classId: string, studentId: string): Promise<Class> {
    const classData = await this.classModel.findById(classId);
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const studentIndex = classData.students.indexOf(new Schema.Types.ObjectId(studentId));
    if (studentIndex === -1) {
      throw new BadRequestException('Student is not in this class');
    }

    classData.students.splice(studentIndex, 1);
    return classData.save();
  }

  async addStaff(classId: string, staffId: string): Promise<Class> {
    const classData = await this.classModel.findById(classId);
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    if (classData.staffs.includes(new Schema.Types.ObjectId(staffId))) {
      throw new BadRequestException('Staff member is already assigned to this class');
    }

    classData.staffs.push(new Schema.Types.ObjectId(staffId));
    return classData.save();
  }

  async removeStaff(classId: string, staffId: string): Promise<Class> {
    const classData = await this.classModel.findById(classId);
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const staffIndex = classData.staffs.indexOf(new Schema.Types.ObjectId(staffId));
    if (staffIndex === -1) {
      throw new BadRequestException('Staff member is not assigned to this class');
    }

    classData.staffs.splice(staffIndex, 1);
    return classData.save();
  }

  async findByStudent(studentId: string): Promise<Class[]> {
    return this.classModel
      .find({ students: studentId })
      .populate('students', 'name email role')
      .populate('staffs', 'name email role')
      .exec();
  }

  async findByStaff(staffId: string): Promise<Class[]> {
    return this.classModel
      .find({ staffs: staffId })
      .populate('students', 'name email role')
      .populate('staffs', 'name email role')
      .exec();
  }

  async findByTeacher(teacherId: string): Promise<Class[]> {
    return this.classModel
      .find({ classTeacher: teacherId })
      .populate('students', 'name email role')
      .populate('staffs', 'name email role')
      .exec();
  }

  async getClassStaff(classId: string): Promise<any[]> {
    console.log(classId)
    const classData = await this.classModel
      .findById(classId)
      // Use mongoose projection to get _id as value and name as label
      .populate({
        path: 'staffs',
        select: 'name',
        transform: (doc) => doc ? { value: doc._id, label: doc.name } : null
      })
      .populate('staffs', 'name')
      .exec();

    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    return classData.staffs || [];
  }
} 