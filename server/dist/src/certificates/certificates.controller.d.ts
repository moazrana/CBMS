import { CertificatesService } from './certificates.service';
import { Response } from 'express';
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    uploadFile(file: Express.Multer.File, req: any): Promise<import("./schemas/certificate.schema").Certificate>;
    findAll(): Promise<import("./schemas/certificate.schema").Certificate[]>;
    findMyCertificates(req: any): Promise<import("./schemas/certificate.schema").Certificate[]>;
    downloadCertificateByAdmin(userId: string, certificateId: string, res: Response): Promise<void>;
    approveEmbedded(userId: string, certificateId: string, expiry: string, req: any): Promise<{
        _id: import("mongoose").Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: import("../users/schemas/user.schema").CertificateStatus;
        expiry?: string;
        approvedBy?: import("mongoose").Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }>;
    rejectEmbedded(userId: string, certificateId: string, req: any, reason: string): Promise<{
        _id: import("mongoose").Types.ObjectId;
        fileName: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        status: import("../users/schemas/user.schema").CertificateStatus;
        expiry?: string;
        approvedBy?: import("mongoose").Types.ObjectId;
        rejectionReason?: string;
        uploadedAt: Date;
    }>;
    findOne(id: string): Promise<import("./schemas/certificate.schema").Certificate>;
    approve(id: string, req: any): Promise<import("./schemas/certificate.schema").Certificate>;
    reject(id: string, req: any, reason: string): Promise<import("./schemas/certificate.schema").Certificate>;
}
