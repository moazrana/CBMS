import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
export declare class PermissionsService {
    private permissionModel;
    constructor(permissionModel: Model<Permission>);
    create(createPermissionDto: CreatePermissionDto): Promise<Permission>;
    findAll(): Promise<Permission[]>;
    findOne(id: string): Promise<Permission>;
    findByModule(module: string): Promise<Permission[]>;
    update(id: string, updatePermissionDto: CreatePermissionDto): Promise<Permission>;
    remove(id: string): Promise<void>;
}
