import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certificate, CertificateDocument, CertificateStatus } from './schemas/certificate.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private certificateModel: Model<CertificateDocument>
  ) {}

  async create(
    teacher: User,
    fileName: string,
    filePath: string,
    fileType: string,
    fileSize: number
  ): Promise<Certificate> {
    const certificate = new this.certificateModel({
      teacher,
      fileName,
      filePath,
      fileType,
      fileSize,
      status: CertificateStatus.PENDING
    });
    return certificate.save();
  }

  async findAll(): Promise<Certificate[]> {
    return this.certificateModel.find()
      .populate('teacher', 'name email')
      .populate('approvedBy', 'name email')
      .exec();
  }

  async findByTeacher(teacherId: string): Promise<Certificate[]> {
    return this.certificateModel.find({ teacher: teacherId })
      .populate('teacher', 'name email')
      .populate('approvedBy', 'name email')
      .exec();
  }

  async findOne(id: string): Promise<Certificate> {
    const certificate = await this.certificateModel.findById(id)
      .populate('teacher', 'name email')
      .populate('approvedBy', 'name email')
      .exec();
    
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }

  async approve(id: string, admin: User): Promise<Certificate> {
    const certificate = await this.certificateModel.findById(id);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    certificate.status = CertificateStatus.APPROVED;
    certificate.approvedBy = admin;
    return certificate.save();
  }

  async reject(id: string, admin: User, reason: string): Promise<Certificate> {
    const certificate = await this.certificateModel.findById(id);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    certificate.status = CertificateStatus.REJECTED;
    certificate.approvedBy = admin;
    certificate.rejectionReason = reason;
    return certificate.save();
  }
} 