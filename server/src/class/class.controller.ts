import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { UserRole } from '../auth/enums/role.enum';

@Controller('classes')
// @UseGuards(JwtAuthGuard, RolesGuard) // Temporarily commented out for seeding
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  async create(
    @Body() createClassDto: CreateClassDto,
    @Request() req?: { user?: { _id: string } },
  ) {
    const created = await this.classService.create(createClassDto);
    await this.auditLogService.logRecordEdit({
      action: 'create',
      module: 'class',
      recordId: String((created as any)._id),
      performedBy: req?.user?._id,
    });
    return created;
  }

  @Get()
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  findAll(
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
    return this.classService.findAll(sortField, sortOrder, searchTerm, pageNum, perPageNum);
  }

  @Get('student/:studentId')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  findByStudent(@Param('studentId') studentId: string) {
    return this.classService.findByStudent(studentId);
  }

  @Get(':id')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  findOne(@Param('id') id: string) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Request() req?: { user?: { _id: string } },
  ) {
    const updated = await this.classService.update(id, updateClassDto);
    await this.auditLogService.logRecordEdit({
      action: 'update',
      module: 'class',
      recordId: id,
      performedBy: req?.user?._id,
    });
    return updated;
  }

  @Delete(':id')
  // @Roles(UserRole.ADMIN) // Temporarily commented out for seeding
  async remove(
    @Param('id') id: string,
    @Request() req?: { user?: { _id: string } },
  ) {
    const result = await this.classService.remove(id);
    await this.auditLogService.logRecordEdit({
      action: 'delete',
      module: 'class',
      recordId: id,
      performedBy: req?.user?._id,
    });
    return result;
  }

  @Post(':id/students/:studentId')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  addStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classService.addStudent(id, studentId);
  }

  @Delete(':id/students/:studentId')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classService.removeStudent(id, studentId);
  }
} 