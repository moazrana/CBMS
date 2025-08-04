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
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const certificate_role_guard_1 = require("./guards/certificate-role.guard");
const common_2 = require("@nestjs/common");
const certificates_service_1 = require("./certificates.service");
const role_schema_1 = require("../users/schemas/role.schema");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const fs_2 = require("fs");
let CertificatesController = class CertificatesController {
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    async uploadFile(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return this.certificatesService.create(req.user, file.originalname, file.path, file.mimetype, file.size);
    }
    async findAll() {
        return this.certificatesService.findAll();
    }
    async findMyCertificates(req) {
        return this.certificatesService.findByTeacher(req.user._id);
    }
    async downloadCertificateByAdmin(userId, certificateId, res) {
        const certificate = await this.certificatesService.getCertificateById(userId, certificateId);
        if (!(0, fs_2.existsSync)(certificate.filePath)) {
            throw new common_1.NotFoundException('File not found on server');
        }
        res.setHeader('Content-Type', certificate.fileType);
        res.setHeader('Content-Disposition', `attachment; filename="${certificate.fileName}"`);
        const fileStream = (0, fs_1.createReadStream)(certificate.filePath);
        fileStream.pipe(res);
    }
    async approveEmbedded(userId, certificateId, expiry, req) {
        return this.certificatesService.approveEmbeddedCertificate(userId, certificateId, req.user._id, expiry);
    }
    async rejectEmbedded(userId, certificateId, req, reason) {
        if (!reason) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        return this.certificatesService.rejectEmbeddedCertificate(userId, certificateId, req.user._id, reason);
    }
    async findOne(id) {
        return this.certificatesService.findOne(id);
    }
    async approve(id, req) {
        return this.certificatesService.approve(id, req.user);
    }
    async reject(id, req, reason) {
        if (!reason) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        return this.certificatesService.reject(id, req.user, reason);
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.Post)('upload'),
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
], CertificatesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(certificate_role_guard_1.CertificateRoleGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-certificates'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "findMyCertificates", null);
__decorate([
    (0, common_1.Get)('download/:userId/:certificateId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('certificateId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "downloadCertificateByAdmin", null);
__decorate([
    (0, common_1.Post)('approve/:userId/:certificateId/:expiry'),
    (0, common_1.UseGuards)(certificate_role_guard_1.CertificateRoleGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('certificateId')),
    __param(2, (0, common_1.Param)('expiry')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "approveEmbedded", null);
__decorate([
    (0, common_1.Post)('reject/:userId/:certificateId'),
    (0, common_1.UseGuards)(certificate_role_guard_1.CertificateRoleGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('certificateId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "rejectEmbedded", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(certificate_role_guard_1.CertificateRoleGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UseGuards)(certificate_role_guard_1.CertificateRoleGuard),
    (0, common_2.SetMetadata)('roles', [role_schema_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "reject", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, common_1.Controller)('certificates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map