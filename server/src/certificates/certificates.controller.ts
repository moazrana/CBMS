import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Request,
  Body,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CertificateRoleGuard } from './guards/certificate-role.guard';
import { SetMetadata } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { UserRole } from '../users/schemas/role.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/certificates',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Invalid file type'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.certificatesService.create(
      req.user,
      file.originalname,
      file.path,
      file.mimetype,
      file.size
    );
  }

  @Get()
  @UseGuards(CertificateRoleGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async findAll() {
    return this.certificatesService.findAll();
  }

  @Get('my-certificates')
  async findMyCertificates(@Request() req: any) {
    return this.certificatesService.findByTeacher(req.user._id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Post(':id/approve')
  @UseGuards(CertificateRoleGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async approve(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.certificatesService.approve(id, req.user);
  }

  @Post(':id/reject')
  @UseGuards(CertificateRoleGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async reject(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason: string
  ) {
    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }
    return this.certificatesService.reject(id, req.user, reason);
  }
} 