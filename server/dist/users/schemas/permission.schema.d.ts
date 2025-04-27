import { Document } from 'mongoose';
export type PermissionDocument = Permission & Document;
export declare class Permission {
    name: string;
    description: string;
    module: string;
    action: string;
}
export declare const PermissionSchema: import("mongoose").Schema<Permission, import("mongoose").Model<Permission, any, any, any, Document<unknown, any, Permission> & Permission & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Permission, Document<unknown, {}, import("mongoose").FlatRecord<Permission>> & import("mongoose").FlatRecord<Permission> & {
    _id: import("mongoose").Types.ObjectId;
}>;
