import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type CertificateDocument = Certificate & Document;
export declare enum CertificateStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Certificate {
    _id: Types.ObjectId;
    teacher: User;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    status: CertificateStatus;
    approvedBy?: User;
    rejectionReason?: string;
}
export declare const CertificateSchema: import("mongoose").Schema<Certificate, import("mongoose").Model<Certificate, any, any, any, Document<unknown, any, Certificate> & Certificate & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Certificate, Document<unknown, {}, import("mongoose").FlatRecord<Certificate>> & import("mongoose").FlatRecord<Certificate> & Required<{
    _id: Types.ObjectId;
}>>;
