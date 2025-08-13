import { Model, Types } from 'mongoose';
import { User, UserDocument, CertificateStatus } from './schemas/user.schema';
import { UserDocument as UserDocumentType, DocumentType } from './schemas/document.schema';
import { Role } from './schemas/role.schema';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private userModel;
    private roleModel;
    constructor(userModel: Model<UserDocument>, roleModel: Model<Role>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(sort: string, order: string, search: string, page: number, perPage: number): Promise<Partial<User>[]>;
    findByRole(role: string): Promise<Partial<User>[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findOneForLogin(id: string): Promise<User>;
    addCertificate(userId: string, fileName: string, filePath: string, fileType: string, fileSize: number): Promise<User>;
    getCertificates(userId: string): Promise<{
        _id: Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: CertificateStatus;
        expiry?: string;
        approvedBy?: Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }[]>;
    getCertificateById(userId: string, certificateId: string): Promise<{
        _id: Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: CertificateStatus;
        expiry?: string;
        approvedBy?: Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }>;
    approveCertificate(userId: string, certificateIndex: number, adminId: string): Promise<User>;
    rejectCertificate(userId: string, certificateIndex: number, adminId: string, reason: string): Promise<User>;
    getAllPendingCertificates(): Promise<Omit<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }, never>[]>;
    getAllCertificatesForAdmin(): Promise<any[]>;
    addDocument(userId: string, fileName: string, filePath: string, fileType: string, fileSize: number, documentType: DocumentType): Promise<User>;
    getDocuments(userId: string): Promise<UserDocumentType[]>;
    approveDocument(userId: string, documentId: string, adminId: string): Promise<User>;
    rejectDocument(userId: string, documentId: string, adminId: string, reason: string): Promise<User>;
    getAllPendingDocuments(): Promise<Omit<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }, never>[]>;
    getDocumentsByType(userId: string, documentType: DocumentType): Promise<UserDocumentType[]>;
    remove(id: string): Promise<User>;
}
