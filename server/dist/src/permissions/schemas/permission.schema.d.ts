import { Document } from 'mongoose';
export declare class Permission extends Document {
    name: string;
    description: string;
    module: string;
}
export declare const PermissionSchema: import("mongoose").Schema<Permission, import("mongoose").Model<Permission, any, any, any, Document<unknown, any, Permission> & Permission & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Permission, Document<unknown, {}, import("mongoose").FlatRecord<Permission>> & import("mongoose").FlatRecord<Permission> & {
    _id: import("mongoose").Types.ObjectId;
}>;
