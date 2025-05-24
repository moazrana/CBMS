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
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const certificate_schema_1 = require("./schemas/certificate.schema");
let CertificatesService = class CertificatesService {
    constructor(certificateModel) {
        this.certificateModel = certificateModel;
    }
    async create(teacher, fileName, filePath, fileType, fileSize) {
        const certificate = new this.certificateModel({
            teacher,
            fileName,
            filePath,
            fileType,
            fileSize,
            status: certificate_schema_1.CertificateStatus.PENDING
        });
        return certificate.save();
    }
    async findAll() {
        return this.certificateModel.find()
            .populate('teacher', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
    }
    async findByTeacher(teacherId) {
        return this.certificateModel.find({ teacher: teacherId })
            .populate('teacher', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
    }
    async findOne(id) {
        const certificate = await this.certificateModel.findById(id)
            .populate('teacher', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        return certificate;
    }
    async approve(id, admin) {
        const certificate = await this.certificateModel.findById(id);
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        certificate.status = certificate_schema_1.CertificateStatus.APPROVED;
        certificate.approvedBy = admin;
        return certificate.save();
    }
    async reject(id, admin, reason) {
        const certificate = await this.certificateModel.findById(id);
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        certificate.status = certificate_schema_1.CertificateStatus.REJECTED;
        certificate.approvedBy = admin;
        certificate.rejectionReason = reason;
        return certificate.save();
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(certificate_schema_1.Certificate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map