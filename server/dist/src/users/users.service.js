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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const document_schema_1 = require("./schemas/document.schema");
const role_schema_1 = require("./schemas/role.schema");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel, roleModel) {
        this.userModel = userModel;
        this.roleModel = roleModel;
    }
    async create(createUserDto) {
        const { email, role: roleName } = createUserDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const role = await this.roleModel.findOne({ name: roleName });
        if (!role) {
            throw new common_1.NotFoundException(`Role '${roleName}' not found`);
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const hashedPin = await bcrypt.hash(createUserDto.pin, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            pin: hashedPin,
            role: role._id,
        });
        return createdUser.save();
    }
    async findAll(sort, order, search, page, perPage) {
        return this.userModel.find({ deletedAt: null })
            .select('-password')
            .populate('role', 'name')
            .sort({ [sort]: order === 'DESC' ? -1 : 1 })
            .where({
            $or: [
                { name: { $regex: search || '', $options: 'i' } },
                { email: { $regex: search || '', $options: 'i' } }
            ]
        })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean()
            .exec()
            .then(users => {
            return users.map((user, index) => ({
                ...user,
                id: ((page - 1) * perPage) + index + 1
            }));
        });
    }
    async findByRole(role) {
        return this.userModel.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'role'
                }
            },
            { $unwind: '$role' },
            { $match: { 'role.name': role, deletedAt: null } },
            {
                $project: {
                    value: '$_id',
                    label: '$name'
                }
            }
        ]);
    }
    async findOne(id) {
        const user = await this.userModel.findOne({ _id: id, deletedAt: null })
            .select('-password')
            .populate({
            path: 'role',
            select: 'name description permissions',
            populate: {
                path: 'permissions',
                select: 'name'
            }
        })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email, deletedAt: null })
            .populate({
            path: 'role',
            select: 'name description permissions',
            populate: {
                path: 'permissions',
                select: 'name'
            }
        })
            .exec();
    }
    async findOneForLogin(id) {
        const user = await this.userModel.findOne({ _id: id, deletedAt: null })
            .select('-password')
            .populate({
            path: 'role',
            select: 'name description permissions',
            populate: {
                path: 'permissions',
                select: 'name'
            }
        })
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async addCertificate(userId, fileName, filePath, fileType, fileSize) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.certificates.push({
            _id: new mongoose_2.Types.ObjectId(),
            fileName,
            filePath,
            fileType,
            fileSize,
            status: user_schema_1.CertificateStatus.PENDING,
            uploadedAt: new Date()
        });
        return user.save();
    }
    async getCertificates(userId) {
        const user = await this.userModel.findById(userId)
            .populate('certificates.approvedBy', 'name email')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found!!!!');
        }
        return user.certificates;
    }
    async getCertificateById(userId, certificateId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const certifiactes = user.certificates;
        const certificate = certifiactes.find((cert) => {
            return cert._id.toString() == certificateId;
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        return certificate;
    }
    async approveCertificate(userId, certificateIndex, adminId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (certificateIndex < 0 || certificateIndex >= user.certificates.length) {
            throw new common_1.BadRequestException('Invalid certificate index');
        }
        user.certificates[certificateIndex].status = user_schema_1.CertificateStatus.APPROVED;
        user.certificates[certificateIndex].approvedBy = new mongoose_2.Types.ObjectId(adminId);
        return user.save();
    }
    async rejectCertificate(userId, certificateIndex, adminId, reason) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (certificateIndex < 0 || certificateIndex >= user.certificates.length) {
            throw new common_1.BadRequestException('Invalid certificate index');
        }
        user.certificates[certificateIndex].status = user_schema_1.CertificateStatus.REJECTED;
        user.certificates[certificateIndex].approvedBy = new mongoose_2.Types.ObjectId(adminId);
        user.certificates[certificateIndex].rejectionReason = reason;
        return user.save();
    }
    async getAllPendingCertificates() {
        return this.userModel.find({
            'certificates.status': user_schema_1.CertificateStatus.PENDING
        })
            .populate('certificates.approvedBy', 'name email')
            .select('name email certificates')
            .exec();
    }
    async getAllCertificatesForAdmin() {
        const users = await this.userModel.find({
            'certificates': { $exists: true, $ne: [] }
        })
            .populate('certificates.approvedBy', 'name email')
            .select('name email certificates expiry')
            .exec();
        const allCertificates = [];
        let certificateId = 1;
        for (const user of users) {
            for (const certificate of user.certificates) {
                allCertificates.push({
                    id: certificateId++,
                    teacher: user.name,
                    fileName: certificate.fileName,
                    status: certificate.status,
                    approvedBy: certificate.approvedBy ? certificate.approvedBy.name : null,
                    rejectionReason: certificate.rejectionReason || null,
                    expiry: certificate.expiry || null,
                    createdAt: certificate.uploadedAt,
                    updatedAt: certificate.uploadedAt,
                    userId: user._id,
                    certificateId: certificate._id
                });
            }
        }
        return allCertificates;
    }
    async addDocument(userId, fileName, filePath, fileType, fileSize, documentType) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const document = {
            _id: new mongoose_2.Types.ObjectId(),
            fileName,
            filePath,
            fileType,
            fileSize,
            documentType,
            status: document_schema_1.DocumentStatus.PENDING,
            uploadedAt: new Date()
        };
        user.documents.push(document);
        return user.save();
    }
    async getDocuments(userId) {
        const user = await this.userModel.findById(userId)
            .populate('documents.approvedBy', 'name email')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.documents;
    }
    async approveDocument(userId, documentId, adminId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const document = user.documents.find(doc => doc._id.toString() === documentId);
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        document.status = document_schema_1.DocumentStatus.APPROVED;
        document.approvedBy = new mongoose_2.Types.ObjectId(adminId);
        return user.save();
    }
    async rejectDocument(userId, documentId, adminId, reason) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const document = user.documents.find(doc => doc._id.toString() === documentId);
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        document.status = document_schema_1.DocumentStatus.REJECTED;
        document.approvedBy = new mongoose_2.Types.ObjectId(adminId);
        document.rejectionReason = reason;
        return user.save();
    }
    async getAllPendingDocuments() {
        return this.userModel.find({
            'documents.status': document_schema_1.DocumentStatus.PENDING
        })
            .populate('documents.approvedBy', 'name email')
            .select('name email documents')
            .exec();
    }
    async getDocumentsByType(userId, documentType) {
        const user = await this.userModel.findById(userId)
            .populate('documents.approvedBy', 'name email')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.documents.filter(doc => doc.documentType === documentType);
    }
    async remove(id) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.deletedAt = new Date();
        return user.save();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map