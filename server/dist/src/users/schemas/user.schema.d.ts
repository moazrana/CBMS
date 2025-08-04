import { Document, Types } from 'mongoose';
import { Role } from './role.schema';
import { UserDocument as UserDocumentType } from './document.schema';
export declare enum CertificateStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class User extends Document {
    name: string;
    email: string;
    password: string;
    pin: string;
    role: Role;
    deletedAt: Date;
    subject: string;
    certificates: Array<{
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
    documents: UserDocumentType[];
}
export type UserDocument = User & Document;
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
}>;
