import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    create(createPermissionDto: CreatePermissionDto): Promise<import("./schemas/permission.schema").Permission>;
    findAll(): Promise<import("./schemas/permission.schema").Permission[]>;
    findOne(id: string): Promise<import("./schemas/permission.schema").Permission>;
    findByModule(module: string): Promise<import("./schemas/permission.schema").Permission[]>;
    update(id: string, updatePermissionDto: CreatePermissionDto): Promise<import("./schemas/permission.schema").Permission>;
    remove(id: string): Promise<void>;
}
