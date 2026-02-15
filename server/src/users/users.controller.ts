import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Request,
  BadRequestException,
  Query,

  Delete,
  Res,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from './schemas/role.schema';
import { DocumentType } from './schemas/document.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async findAll(
    @Query('sort') sort?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<Partial<User>[]> {
    return this.usersService.findAll(sort, order, search, page, perPage);
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async findAllByRol(@Param('role') role:string): Promise<Partial<User>[]> {
    return this.usersService.findByRole(role);
  }

  @Get('staff/search')
  @UseGuards(JwtAuthGuard)
  async findStaffForSelect(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<Partial<User>[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 20;
    return this.usersService.findStaffForSelect(search || '', pageNum, perPageNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<User> {
    // console.log('tha pe')
    return this.usersService.findOne(id);
  }

  @Post('certificates/upload')
  @UseGuards(JwtAuthGuard)
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
  async uploadCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.usersService.addCertificate(
      req.user._id,
      file.originalname,
      file.path,
      file.mimetype,
      file.size
    );
  }

  @Get('certificates/my')
  @UseGuards(JwtAuthGuard)
  async getMyCertificates(@Request() req: any) {
    return this.usersService.getCertificates(req.user._id);
  }

  @Get('certificates/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async getPendingCertificates() {
    return this.usersService.getAllPendingCertificates();
  }

  @Get('certificates/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async getAllCertificates() {
    return this.usersService.getAllCertificatesForAdmin();
  }

  @Post('certificates/:userId/:index/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async approveCertificate(
    @Param('userId') userId: string,
    @Param('index') index: number,
    @Request() req: any
  ) {
    return this.usersService.approveCertificate(userId, index, req.user._id);
  }

  @Post('certificates/:userId/:index/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async rejectCertificate(
    @Param('userId') userId: string,
    @Param('index') index: number,
    @Request() req: any,
    @Body('reason') reason: string
  ) {
    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }
    return this.usersService.rejectCertificate(userId, index, req.user._id, reason);
  }

  @Post('documents/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
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
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body('documentType') documentType: DocumentType
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!documentType || !Object.values(DocumentType).includes(documentType)) {
      throw new BadRequestException('Invalid document type');
    }

    return this.usersService.addDocument(
      req.user._id,
      file.originalname,
      file.path,
      file.mimetype,
      file.size,
      documentType
    );
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  
  async getMyDocuments(
    @Request() req: any,
    @Query('type') type?: DocumentType
  ) {
    if (type) {
      return this.usersService.getDocumentsByType(req.user._id, type);
    }
    return this.usersService.getDocuments(req.user._id);
  }

  @Get('documents/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async getPendingDocuments() {
    return this.usersService.getAllPendingDocuments();
  }

  @Post('documents/:documentId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async approveDocument(
    @Param('documentId') documentId: string,
    @Request() req: any
  ) {
    return this.usersService.approveDocument(req.user._id, documentId, req.user._id);
  }

  @Post('documents/:documentId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [UserRole.ADMIN])
  async rejectDocument(
    @Param('documentId') documentId: string,
    @Request() req: any,
    @Body('reason') reason: string
  ) {
    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }
    return this.usersService.rejectDocument(req.user._id, documentId, req.user._id, reason);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @HasPermission('delete_user')
  async remove(@Param('id') id: string): Promise<Partial<User>> {
    return this.usersService.remove(id);
  }
  
  @Get('certificates/download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadCertificate(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response
  ) {
    const certificate = await this.usersService.getCertificateById(req.user._id, id);
    
    // Check if file exists
    if (!existsSync(certificate.filePath)) {
      throw new NotFoundException('File not found on server');
    }

    // Set headers for file download
    res.setHeader('Content-Type', certificate.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.fileName}"`);
    
    // Create read stream and pipe to response
    const fileStream = createReadStream(certificate.filePath);
    fileStream.pipe(res);
  }

  @Get('staff/:staffId/students')
  @UseGuards(JwtAuthGuard)
  async getStaffStudents(@Param('staffId') staffId: string) {
    return this.usersService.getTeacherStudents(staffId);
  }

  

} 