import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema as MongooseSchema } from 'mongoose';
import { Class, ClassDocument } from './class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  private async isDuplicate(
    location: string,
    subject: string,
    yeargroup: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query: Record<string, unknown> = {
      location: (location || '').trim(),
      subject: (subject || '').trim(),
      yeargroup: (yeargroup || '').trim(),
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await this.classModel.findOne(query).exec();
    return !!existing;
  }

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const location = (createClassDto.location || '').trim();
    const subject = (createClassDto.subject || '').trim();
    const yeargroup = (createClassDto.yeargroup || '').trim();

    if (await this.isDuplicate(location, subject, yeargroup)) {
      throw new BadRequestException(
        'A class with this location, subject and year group already exists.',
      );
    }

    try {
      const createdClass = new this.classModel(createClassDto);
      return await createdClass.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'A class with this location, subject and year group already exists.',
        );
      }
      throw error;
    }
  }

  async findAll(sort: string = 'createdAt', order: string = 'DESC', search: string = '', page: number = 1, perPage: number = 10): Promise<Class[]> {
    const sortOrder = order === 'DESC' ? -1 : 1;
    const query = this.classModel.find();
    
    if (search) {
      query.where({
        $or: [
          { location: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { yeargroup: { $regex: search, $options: 'i' } },
        ],
      });
    }
    
    return query
      .sort({ [sort]: sortOrder })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('students')
      .exec();
  }

  async findOne(id: string): Promise<Class> {
    const classData = await this.classModel
      .findById(id)
      .populate('students')
      .exec();

    if (!classData) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classData;
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const existing = await this.classModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const location = (updateClassDto.location ?? existing.location).toString().trim();
    const subject = (updateClassDto.subject ?? existing.subject).toString().trim();
    const yeargroup = (updateClassDto.yeargroup ?? existing.yeargroup).toString().trim();

    if (await this.isDuplicate(location, subject, yeargroup, id)) {
      throw new BadRequestException(
        'A class with this location, subject and year group already exists.',
      );
    }

    try {
      const updatedClass = await this.classModel
        .findByIdAndUpdate(id, updateClassDto, { new: true })
        .populate('students')
        .exec();

      if (!updatedClass) {
        throw new NotFoundException(`Class with ID ${id} not found`);
      }
      return updatedClass;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'A class with this location, subject and year group already exists.',
        );
      }
      throw error;
    }
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

    const studentObjectId = new Types.ObjectId(studentId);
    const studentExists = classData.students.some(
      (id) => id.toString() === studentObjectId.toString()
    );

    if (studentExists) {
      throw new BadRequestException('Student is already in this class');
    }

    classData.students.push(studentObjectId as unknown as MongooseSchema.Types.ObjectId);
    return classData.save();
  }

  async removeStudent(classId: string, studentId: string): Promise<Class> {
    const classData = await this.classModel.findById(classId);
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const studentObjectId = new Types.ObjectId(studentId);
    const originalLength = classData.students.length;
    classData.students = classData.students.filter(
      (id) => id.toString() !== studentObjectId.toString()
    );

    if (classData.students.length === originalLength) {
      throw new BadRequestException('Student is not in this class');
    }

    return classData.save();
  }

  async findByStudent(studentId: string): Promise<Class[]> {
    return this.classModel
      .find({ students: studentId })
      .populate('students')
      .exec();
  }
} 