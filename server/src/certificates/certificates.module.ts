import { Module,forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';
import { CertificateRoleGuard } from './guards/certificate-role.guard';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { MailService } from '../services/mail.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UsersModule), // <-- Use forwardRef here
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificateRoleGuard,MailService],
  exports: [CertificatesService]
})
export class CertificatesModule {} 