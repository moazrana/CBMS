import { Document, Types } from 'mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';
export declare class Role extends Document {
    name: string;
    description: string;
    permissions: Permission[];
}
export declare const RoleSchema: import("mongoose").Schema<Role, import("mongoose").Model<Role, any, any, any, Document<unknown, any, Role> & Role & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, Document<unknown, {}, import("mongoose").FlatRecord<Role>> & import("mongoose").FlatRecord<Role> & {
    _id: Types.ObjectId;
}>;
