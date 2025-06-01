import { Document } from 'mongoose';
import { Permission } from './permission.schema';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MANAGER = "manager"
}
export type RoleDocument = Role & Document;
export declare class Role extends Document {
    name: string;
    description: string;
    permissions: Permission[];
    isDefault?: boolean;
}
export declare const RoleSchema: import("mongoose").Schema<Role, import("mongoose").Model<Role, any, any, any, Document<unknown, any, Role> & Role & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, Document<unknown, {}, import("mongoose").FlatRecord<Role>> & import("mongoose").FlatRecord<Role> & {
    _id: import("mongoose").Types.ObjectId;
}>;
