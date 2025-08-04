import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, CertificateStatus } from './schemas/user.schema';
import { UserDocument as UserDocumentType, DocumentStatus, DocumentType } from './schemas/document.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;
    
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(sort: string, order: string, search: string, page: number, perPage: number): Promise<Partial<User>[]> {
    return this.userModel.find({ deletedAt: null })
      .select('-password')
      .populate('role', 'name')
      .sort({ [sort]: order === 'DESC' ? -1 : 1 })
      .where({
        $or: [
          { name: { $regex: search || '', $options: 'i' } },
          { email: { $regex: search || '', $options: 'i' } }
        ]
      })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean()
      .exec()
      .then(users => {
        return users.map((user, index) => ({
          ...user,
          id: ((page - 1) * perPage) + index + 1
        }));
      });
  }

  async findByRole(role:string): Promise<Partial<User>[]> {
    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: '$role' },
      { $match: { 'role.name': role,deletedAt:null } },
      {
        $project:{
          value:'$_id',
          label:'$name'
        }
      }
    ]);
     
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null })
      .select('-password')
      .populate('role', 'name')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email, deletedAt: null })
      .populate('role', 'name')
      .exec();
  }

  async addCertificate(
    userId: string,
    fileName: string,
    filePath: string,
    fileType: string,
    fileSize: number
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.certificates.push({
      _id: new Types.ObjectId(),
      fileName,
      filePath,
      fileType,
      fileSize,
      status: CertificateStatus.PENDING,
      uploadedAt: new Date()
    });

    return user.save();
  }

  async getCertificates(userId: string) {
    const user = await this.userModel.findById(userId)
      .populate('certificates.approvedBy', 'name email')
      .exec()
      if (!user) {
        throw new NotFoundException('User not found!!!!');
      }
     
      // Add unique _id to each certificate for frontend identification
      return user.certificates;
  }

  async getCertificateById(userId:string,certificateId: string) {
    const user=await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const certifiactes=user.certificates
    const certificate=certifiactes.find((cert)=>{
      return cert._id.toString()==certificateId
    })
    
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    
    return certificate;
  }

  async approveCertificate(
    userId: string,
    certificateIndex: number,
    adminId: string
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (certificateIndex < 0 || certificateIndex >= user.certificates.length) {
      throw new BadRequestException('Invalid certificate index');
    }

    user.certificates[certificateIndex].status = CertificateStatus.APPROVED;
    user.certificates[certificateIndex].approvedBy =  new Types.ObjectId(adminId);

    return user.save();
  }

  async rejectCertificate(
    userId: string,
    certificateIndex: number,
    adminId: string,
    reason: string
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (certificateIndex < 0 || certificateIndex >= user.certificates.length) {
      throw new BadRequestException('Invalid certificate index');
    }

    user.certificates[certificateIndex].status = CertificateStatus.REJECTED;
    user.certificates[certificateIndex].approvedBy = new Types.ObjectId(adminId);
    user.certificates[certificateIndex].rejectionReason = reason;

    return user.save();
  }

  async getAllPendingCertificates() {
    return this.userModel.find({
      'certificates.status': CertificateStatus.PENDING
    })
    .populate('certificates.approvedBy', 'name email')
    .select('name email certificates')
    .exec();
  }

  async getAllCertificatesForAdmin() {
    const users = await this.userModel.find({
      'certificates': { $exists: true, $ne: [] }
    })
    .populate('certificates.approvedBy', 'name email')
    .select('name email certificates expiry')
    .exec();

    const allCertificates = [];
    let certificateId = 1;

    for (const user of users) {
      for (const certificate of user.certificates) {
        allCertificates.push({
          id: certificateId++,
          teacher: user.name,
          fileName: certificate.fileName,
          status: certificate.status,
          approvedBy: certificate.approvedBy ? (certificate.approvedBy as any).name : null,
          rejectionReason: certificate.rejectionReason || null,
          expiry:certificate.expiry||null,
          createdAt: certificate.uploadedAt,
          updatedAt: certificate.uploadedAt, // Using uploadedAt as updatedAt for now
          userId: user._id,
          certificateId: certificate._id
        });
      }
    }

    return allCertificates;
  }

  async addDocument(
    userId: string,
    fileName: string,
    filePath: string,
    fileType: string,
    fileSize: number,
    documentType: DocumentType
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const document: UserDocumentType = {
      _id: new Types.ObjectId(),
      fileName,
      filePath,
      fileType,
      fileSize,
      documentType,
      status: DocumentStatus.PENDING,
      uploadedAt: new Date()
    };

    user.documents.push(document);
    return user.save();
  }

  async getDocuments(userId: string) {
    const user = await this.userModel.findById(userId)
      .populate('documents.approvedBy', 'name email')
      .exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.documents;
  }

  async approveDocument(
    userId: string,
    documentId: string,
    adminId: string
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const document = user.documents.find(doc => doc._id.toString() === documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = DocumentStatus.APPROVED;
    document.approvedBy = new Types.ObjectId(adminId);

    return user.save();
  }

  async rejectDocument(
    userId: string,
    documentId: string,
    adminId: string,
    reason: string
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const document = user.documents.find(doc => doc._id.toString() === documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = DocumentStatus.REJECTED;
    document.approvedBy = new Types.ObjectId(adminId);
    document.rejectionReason = reason;

    return user.save();
  }

  async getAllPendingDocuments() {
    return this.userModel.find({
      'documents.status': DocumentStatus.PENDING
    })
    .populate('documents.approvedBy', 'name email')
    .select('name email documents')
    .exec();
  }

  async getDocumentsByType(userId: string, documentType: DocumentType) {
    const user = await this.userModel.findById(userId)
      .populate('documents.approvedBy', 'name email')
      .exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.documents.filter(doc => doc.documentType === documentType);
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by setting deletedAt timestamp
    user.deletedAt = new Date();
    return user.save();
  }
} 