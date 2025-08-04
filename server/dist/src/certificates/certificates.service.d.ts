import { Model } from 'mongoose';
import { Certificate, CertificateDocument } from './schemas/certificate.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { MailService } from 'src/services/mail.service';
export declare class CertificatesService {
    private certificateModel;
    private userModel;
    private readonly mailService;
    constructor(certificateModel: Model<CertificateDocument>, userModel: Model<UserDocument>, mailService: MailService);
    create(teacher: User, fileName: string, filePath: string, fileType: string, fileSize: number): Promise<Certificate>;
    findAll(): Promise<Certificate[]>;
    findByTeacher(teacherId: string): Promise<Certificate[]>;
    findOne(id: string): Promise<Certificate>;
    approve(id: string, admin: User): Promise<Certificate>;
    reject(id: string, admin: User, reason: string): Promise<Certificate>;
    getCertificateById(userId: string, certificateId: string): Promise<{
        _id: Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: import("../users/schemas/user.schema").CertificateStatus;
        expiry?: string;
        approvedBy?: Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }>;
    approveEmbeddedCertificate(userId: string, certificateId: string, adminId: string, expiry: string): Promise<{
        _id: Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: import("../users/schemas/user.schema").CertificateStatus;
        expiry?: string;
        approvedBy?: Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }>;
    rejectEmbeddedCertificate(userId: string, certificateId: string, adminId: string, reason: string): Promise<{
        _id: Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: import("../users/schemas/user.schema").CertificateStatus;
        expiry?: string;
        approvedBy?: Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }>;
}
