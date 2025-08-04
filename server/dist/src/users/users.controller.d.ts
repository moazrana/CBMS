import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { DocumentType } from './schemas/document.schema';
import { Response } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(sort?: string, order?: 'ASC' | 'DESC', search?: string, page?: number, perPage?: number): Promise<Partial<User>[]>;
    findAllByRol(role: string): Promise<Partial<User>[]>;
    findOne(id: string): Promise<User>;
    uploadCertificate(file: Express.Multer.File, req: any): Promise<User>;
    getMyCertificates(req: any): Promise<{
        _id: import("mongoose").Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: import("./schemas/user.schema").CertificateStatus;
        expiry?: string;
        approvedBy?: import("mongoose").Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }[]>;
    getPendingCertificates(): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    getAllCertificates(): Promise<any[]>;
    approveCertificate(userId: string, index: number, req: any): Promise<User>;
    rejectCertificate(userId: string, index: number, req: any, reason: string): Promise<User>;
    uploadDocument(file: Express.Multer.File, req: any, documentType: DocumentType): Promise<User>;
    getMyDocuments(req: any, type?: DocumentType): Promise<import("./schemas/document.schema").UserDocument[]>;
    getPendingDocuments(): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    approveDocument(documentId: string, req: any): Promise<User>;
    rejectDocument(documentId: string, req: any, reason: string): Promise<User>;
    remove(id: string): Promise<Partial<User>>;
    downloadCertificate(id: string, req: any, res: Response): Promise<void>;
}
