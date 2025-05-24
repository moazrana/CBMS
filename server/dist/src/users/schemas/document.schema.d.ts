import { Document as MongooseDocument, Types } from 'mongoose';
import { User } from './user.schema';
export type DocumentDocument = UserDocument & MongooseDocument;
export declare enum DocumentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum DocumentType {
    CERTIFICATE = "certificate",
    DEGREE = "degree",
    ID_PROOF = "id_proof",
    OTHER = "other"
}
export declare class UserDocument {
    _id: Types.ObjectId;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    documentType: DocumentType;
    status: DocumentStatus;
    approvedBy?: Types.ObjectId | User;
    rejectionReason?: string;
    uploadedAt: Date;
}
export declare const DocumentSchema: import("mongoose").Schema<UserDocument, import("mongoose").Model<UserDocument, any, any, any, MongooseDocument<unknown, any, UserDocument> & UserDocument & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserDocument, MongooseDocument<unknown, {}, import("mongoose").FlatRecord<UserDocument>> & import("mongoose").FlatRecord<UserDocument> & Required<{
    _id: Types.ObjectId;
}>>;
