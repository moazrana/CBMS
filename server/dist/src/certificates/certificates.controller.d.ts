import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    uploadFile(file: Express.Multer.File, req: any): Promise<import("./schemas/certificate.schema").Certificate>;
    findAll(): Promise<import("./schemas/certificate.schema").Certificate[]>;
    findMyCertificates(req: any): Promise<import("./schemas/certificate.schema").Certificate[]>;
    findOne(id: string): Promise<import("./schemas/certificate.schema").Certificate>;
    approve(id: string, req: any): Promise<import("./schemas/certificate.schema").Certificate>;
    reject(id: string, req: any, reason: string): Promise<import("./schemas/certificate.schema").Certificate>;
}
