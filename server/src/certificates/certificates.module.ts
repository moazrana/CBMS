import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';
import { CertificateRoleGuard } from './guards/certificate-role.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema }
    ])
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificateRoleGuard],
  exports: [CertificatesService]
})
export class CertificatesModule {} 