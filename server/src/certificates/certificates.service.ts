import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certificate, CertificateDocument, CertificateStatus } from './schemas/certificate.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { MailService } from 'src/services/mail.service';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)private certificateModel: Model<CertificateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService
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
  async getCertificateById(userId: string, certificateId: string) {
    // Find the user by userId
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the certificate in the user's certificates array
    const certificate = user.certificates.find(
      (cert) => cert._id.toString() === certificateId
    );
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async approveEmbeddedCertificate(userId: string, certificateId: string, adminId: string,expiry:string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const certificate = user.certificates.find(
      (cert) => cert._id.toString() === certificateId
    );
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    certificate.expiry=expiry
    certificate.status = CertificateStatus.APPROVED;
    certificate.approvedBy = new Types.ObjectId(adminId);
    certificate.rejectionReason = undefined;
    await user.save();

    await this.mailService.sendEmail(
      'muaazmehmood@gmail.com',
      'Good News',
      'Text body',
      'certificateApproved'
    );
    return certificate;
  }

  async rejectEmbeddedCertificate(userId: string, certificateId: string, adminId: string, reason: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const certificate = user.certificates.find(
      (cert) => cert._id.toString() === certificateId
    );
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    certificate.status = CertificateStatus.REJECTED;
    certificate.approvedBy = new Types.ObjectId(adminId);
    certificate.rejectionReason = reason;
    await user.save();

    await this.mailService.sendEmail(
      'muaazmehmood@gmail.com',
      'Bad News',
      'Text body',
      'certificateRejected'
    );
    return certificate;
  }
} 