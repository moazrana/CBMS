import { Model } from 'mongoose';
import { Certificate, CertificateDocument } from './schemas/certificate.schema';
import { User } from '../users/schemas/user.schema';
export declare class CertificatesService {
    private certificateModel;
    constructor(certificateModel: Model<CertificateDocument>);
    create(teacher: User, fileName: string, filePath: string, fileType: string, fileSize: number): Promise<Certificate>;
    findAll(): Promise<Certificate[]>;
    findByTeacher(teacherId: string): Promise<Certificate[]>;
    findOne(id: string): Promise<Certificate>;
    approve(id: string, admin: User): Promise<Certificate>;
    reject(id: string, admin: User, reason: string): Promise<Certificate>;
}
