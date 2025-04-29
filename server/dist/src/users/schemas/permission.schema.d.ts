import { Document, Types } from 'mongoose';
export type PermissionDocument = Permission & Document;
export declare class Permission {
    _id: Types.ObjectId;
    name: string;
    description: string;
    module: string;
    action: string;
}
export declare const PermissionSchema: import("mongoose").Schema<Permission, import("mongoose").Model<Permission, any, any, any, Document<unknown, any, Permission> & Permission & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Permission, Document<unknown, {}, import("mongoose").FlatRecord<Permission>> & import("mongoose").FlatRecord<Permission> & Required<{
    _id: Types.ObjectId;
}>>;
