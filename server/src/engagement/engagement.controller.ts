import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CreateEngagementDto } from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';
import { SubmitEngagementDto } from './dto/submit-engagement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { UsersService } from '../users/users.service';
import { RolePermissionService } from '../roles/services/role-permission.service';

@Controller('engagements')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class EngagementController {
  constructor(
    private readonly engagementService: EngagementService,
    private readonly usersService: UsersService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  @Post()
  @HasPermission('create_engagement')
  create(@Body() createEngagementDto: CreateEngagementDto) {
    return this.engagementService.create(createEngagementDto);
  }

  @Post('submit')
  @HasPermission('create_engagement')
  submit(@Body() dto: SubmitEngagementDto) {
    return this.engagementService.submitEngagementsForStudent(
      dto.classId,
      dto.studentId,
      dto.engagementDate,
    );
  }

  @Get()
  @HasPermission('read_engagement')
  async findAll(
    @Req() req: { user: { _id: string } },
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('marked') marked?: string,
  ) {
    const sortField = sort || 'createdAt';
    const sortOrder = order || 'DESC';
    const searchTerm = search || '';
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 10;
    if (marked === 'true') {
      await this.requireMarkedEngagementPermission(req);
      return this.engagementService.findMarkedEngagements(sortField, sortOrder, pageNum, perPageNum);
    }
    return this.engagementService.findAll(sortField, sortOrder, searchTerm, pageNum, perPageNum);
  }

  @Get(':id')
  @HasPermission('read_engagement')
  findOne(@Param('id') id: string) {
    return this.engagementService.findOne(id);
  }

  @Patch(':id')
  @HasPermission('update_engagement')
  update(@Param('id') id: string, @Body() updateEngagementDto: UpdateEngagementDto) {
    return this.engagementService.update(id, updateEngagementDto);
  }

  @Delete(':id')
  @HasPermission('delete_engagement')
  remove(@Param('id') id: string) {
    return this.engagementService.remove(id);
  }

  @Get('class/:classId')
  @HasPermission('read_engagement')
  async findByClass(
    @Req() req: { user: { _id: string } },
    @Param('classId') classId: string,
    @Query('date') engagementDate?: string,
    @Query('marked') marked?: string,
  ) {
    if (marked === 'true') {
      await this.requireMarkedEngagementPermission(req);
      return this.engagementService.findByClassMarked(classId, engagementDate);
    }
    return this.engagementService.findByClass(classId, engagementDate);
  }

  private async requireMarkedEngagementPermission(req: { user: { _id: string } }): Promise<void> {
    const user = await this.usersService.findOne(req.user._id);
    if (!user?.role) {
      throw new ForbiddenException('User has no role assigned');
    }
    const roleId =
      user.role && typeof user.role === 'object' && '_id' in user.role
        ? String((user.role as { _id: unknown })._id)
        : String(user.role);
    const allowed = await this.rolePermissionService.hasPermission(roleId, 'read_marked_engagement');
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions to view marked engagements');
    }
  }

  @Get('location/attendance-stats')
  @HasPermission('read_engagement')
  getLocationAttendanceStats(
    @Query('location') locationName: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.engagementService.getLocationAttendanceStats(locationName, startDate, endDate);
  }

  @Get('student/:studentId/attendance-stats')
  @HasPermission('read_engagement')
  getStudentAttendanceStats(
    @Param('studentId') studentId: string,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.engagementService.getStudentAttendanceStats(studentId, classId, startDate, endDate);
  }

  @Get('student/:studentId')
  @HasPermission('read_engagement')
  findByStudent(@Param('studentId') studentId: string) {
    return this.engagementService.findByStudent(studentId);
  }

  @Get('class/:classId/student/:studentId')
  @HasPermission('read_engagement')
  findByClassAndStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.engagementService.findByClassAndStudent(classId, studentId);
  }

  @Get('class/:classId/student/:studentId/session/:session')
  @HasPermission('read_engagement')
  findByClassStudentAndSession(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Param('session') session: string,
    @Query('date') engagementDate?: string,
  ) {
    return this.engagementService.findByClassStudentAndSession(classId, studentId, session, engagementDate);
  }
}

