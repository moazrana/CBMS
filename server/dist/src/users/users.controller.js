"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permission_guard_1 = require("../auth/guards/permission.guard");
const common_2 = require("@nestjs/common");
const role_schema_1 = require("./schemas/role.schema");
const document_schema_1 = require("./schemas/document.schema");
const multer_1 = require("multer");
const path_1 = require("path");
const has_permission_decorator_1 = require("../auth/decorators/has-permission.decorator");
const fs_1 = require("fs");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async findAll(sort, order, search, page, perPage) {
        return this.usersService.findAll(sort, order, search, page, perPage);
    }
    async findAllByRol(role) {
        return this.usersService.findByRole(role);
    }
    async findOne(id) {
        return this.usersService.findOne(id);
    }
    async uploadCertificate(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return this.usersService.addCertificate(req.user._id, file.originalname, file.path, file.mimetype, file.size);
    }
    async getMyCertificates(req) {
        return this.usersService.getCertificates(req.user._id);
    }
    async getPendingCertificates() {
        return this.usersService.getAllPendingCertificates();
    }
    async getAllCertificates() {
        return this.usersService.getAllCertificatesForAdmin();
    }
    async approveCertificate(userId, index, req) {
        return this.usersService.approveCertificate(userId, index, req.user._id);
    }
    async rejectCertificate(userId, index, req, reason) {
        if (!reason) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        return this.usersService.rejectCertificate(userId, index, req.user._id, reason);
    }
    async uploadDocument(file, req, documentType) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!documentType || !Object.values(document_schema_1.DocumentType).includes(documentType)) {
            throw new common_1.BadRequestException('Invalid document type');
        }
        return this.usersService.addDocument(req.user._id, file.originalname, file.path, file.mimetype, file.size, documentType);
    }
    async getMyDocuments(req, type) {
        if (type) {
            return this.usersService.getDocumentsByType(req.user._id, type);
        }
        return this.usersService.getDocuments(req.user._id);
    }
    async getPendingDocuments() {
        return this.usersService.getAllPendingDocuments();
    }
    async approveDocument(documentId, req) {
        return this.usersService.approveDocument(req.user._id, documentId, req.user._id);
    }
    async rejectDocument(documentId, req, reason) {
        if (!reason) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        return this.usersService.rejectDocument(req.user._id, documentId, req.user._id, reason);
    }
    async remove(id) {
        return this.usersService.remove(id);
    }
    async downloadCertificate(id, req, res) {
        const certificate = await this.usersService.getCertificateById(req.user._id, id);
        if (!(0, fs_1.existsSync)(certificate.filePath)) {
            throw new common_1.NotFoundException('File not found on server');
        }
        res.setHeader('Content-Type', certificate.fileType);
        res.setHeader('Content-Disposition', `attachment; filename="${certificate.fileName}"`);
        const fileStream = (0, fs_1.createReadStream)(certificate.filePath);
        fileStream.pipe(res);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Query)('sort')),
    __param(1, (0, common_1.Query)('order')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('perPage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('role/:role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllByRol", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('certificates/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/certificates',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Invalid file type'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadCertificate", null);
__decorate([
    (0, common_1.Get)('certificates/my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyCertificates", null);
__decorate([
    (0, common_1.Get)('certificates/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPendingCertificates", null);
__decorate([
    (0, common_1.Get)('certificates/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllCertificates", null);
__decorate([
    (0, common_1.Post)('certificates/:userId/:index/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('index')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "approveCertificate", null);
__decorate([
    (0, common_1.Post)('certificates/:userId/:index/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('index')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rejectCertificate", null);
__decorate([
    (0, common_1.Post)('documents/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/documents',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Invalid file type'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('documentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyDocuments", null);
__decorate([
    (0, common_1.Get)('documents/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPendingDocuments", null);
__decorate([
    (0, common_1.Post)('documents/:documentId/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "approveDocument", null);
__decorate([
    (0, common_1.Post)('documents/:documentId/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rejectDocument", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, has_permission_decorator_1.HasPermission)('delete_user'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('certificates/download/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "downloadCertificate", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map