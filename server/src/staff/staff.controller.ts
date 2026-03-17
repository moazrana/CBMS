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
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/role.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  async createStaff(
    @Body() createStaffDto: CreateStaffDto,
    @Request() req: { user?: { _id: string } },
  ) {
    const created = await this.staffService.create(createStaffDto);
    await this.auditLogService.logRecordEdit({
      action: 'create',
      module: 'staff',
      recordId: String(created._id),
      performedBy: req?.user?._id,
    });
    return created;
  }

  @Get()
  async findAllStaff(
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
    return this.staffService.findAll(sortField, sortOrder, searchTerm, pageNum, perPageNum);
  }
  
  @Patch(':id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @Request() req: { user?: { _id: string } },
  ) {
    const updated = await this.staffService.update(id, updateStaffDto);
    await this.auditLogService.logRecordEdit({
      action: 'update',
      module: 'staff',
      recordId: id,
      performedBy: req?.user?._id,
    });
    return updated;
  }

  @Get(':id')
  async findStaffById(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }


  @Delete(':id')
  async removeStaff(
    @Param('id') id: string,
    @Request() req: { user?: { _id: string } },
  ) {
    const result = await this.staffService.remove(id);
    await this.auditLogService.logRecordEdit({
      action: 'delete',
      module: 'staff',
      recordId: id,
      performedBy: req?.user?._id,
    });
    return result;
  }

  @Get(':staffId/students')
  async getStaffStudents(@Param('staffId') staffId: string) {
    return this.usersService.getTeacherStudents(staffId);
  }
}
