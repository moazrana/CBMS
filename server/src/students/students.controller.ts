import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/role.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @Request() req: { user?: { _id: string } },
  ) {
    const created = await this.studentsService.create(createStudentDto);
    await this.auditLogService.logRecordEdit({
      action: 'create',
      module: 'students',
      recordId: String(created._id),
      performedBy: req?.user?._id,
    });
    return created;
  }

  @Get()
  async findAllStudents(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const sortField = sort || 'createdAt';
    const sortOrder = order || 'DESC';
    const searchTerm = search || '';
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 10;
    return this.studentsService.findAll(sortField, sortOrder, searchTerm, pageNum, perPageNum);
  }

  @Get('adno/:adno')
  async findStudentByADNO(@Param('adno') adno: string) {
    const student = await this.studentsService.findByADNO(adno);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  @Get('upn/:upn')
  async findStudentByUPN(@Param('upn') upn: string) {
    const student = await this.studentsService.findByUPN(upn);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  @Get(':id')
  async findStudentById(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  async updateStudent(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Request() req: { user?: { _id: string } },
  ) {
    const updated = await this.studentsService.update(id, updateStudentDto);
    await this.auditLogService.logRecordEdit({
      action: 'update',
      module: 'students',
      recordId: id,
      performedBy: req?.user?._id,
    });
    return updated;
  }

  @Delete(':id')
  async removeStudent(
    @Param('id') id: string,
    @Request() req: { user?: { _id: string } },
  ) {
    const result = await this.studentsService.remove(id);
    await this.auditLogService.logRecordEdit({
      action: 'delete',
      module: 'students',
      recordId: id,
      performedBy: req?.user?._id,
    });
    return result;
  }

  @Delete(':id/hard')
  async hardDeleteStudent(@Param('id') id: string) {
    return this.studentsService.hardDelete(id);
  }
}

