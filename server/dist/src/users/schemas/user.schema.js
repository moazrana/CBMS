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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = exports.CertificateStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("./role.schema");
var CertificateStatus;
(function (CertificateStatus) {
    CertificateStatus["PENDING"] = "pending";
    CertificateStatus["APPROVED"] = "approved";
    CertificateStatus["REJECTED"] = "rejected";
})(CertificateStatus || (exports.CertificateStatus = CertificateStatus = {}));
let User = class User extends mongoose_2.Document {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "pin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Role' }),
    __metadata("design:type", role_schema_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            _id: mongoose_2.Types.ObjectId,
            fileName: String,
            filePath: String,
            fileType: String,
            fileSize: Number,
            status: {
                type: String,
                enum: Object.values(CertificateStatus),
                default: CertificateStatus.PENDING
            },
            expiry: String,
            approvedBy: {
                type: mongoose_2.Types.ObjectId,
                ref: 'User'
            },
            rejectionReason: String,
            uploadedAt: Date
        }]),
    __metadata("design:type", Array)
], User.prototype, "certificates", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            _id: mongoose_2.Types.ObjectId,
            fileName: String,
            filePath: String,
            fileType: String,
            fileSize: Number,
            documentType: String,
            status: String,
            approvedBy: {
                type: mongoose_2.Types.ObjectId,
                ref: 'User'
            },
            rejectionReason: String,
            uploadedAt: Date
        }]),
    __metadata("design:type", Array)
], User.prototype, "documents", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map