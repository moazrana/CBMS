import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './schemas/role.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/role.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  async create(@Body() data: any): Promise<boolean> {
    return !!(await this.rolesService.create(data));
  }

  @Get()
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<Role> {
    return this.rolesService.findByName(name);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: any,
    @Request() req: { user?: { _id: string } },
  ): Promise<boolean> {
    try {
      const updatedRole = await this.rolesService.update(id, updateRoleDto);
      if (updatedRole && req?.user?._id) {
        await this.auditLogService.logRecordEdit({
          action: 'update',
          module: 'roles',
          recordId: id,
          performedBy: req.user._id,
        });
      }
      return !!updatedRole;
    } catch (error) {
      return false;
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user?: { _id: string } },
  ): Promise<Role> {
    const removed = await this.rolesService.remove(id);
    if (req?.user?._id) {
      await this.auditLogService.logRecordEdit({
        action: 'delete',
        module: 'roles',
        recordId: id,
        performedBy: req.user._id,
      });
    }
    return removed;
  }
} 