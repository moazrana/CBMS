import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from './audit-log.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findRecent(
    @Query('limit') limit?: string,
    @Query('module') module?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
  ) {
    const limitNum = limit ? Math.min(parseInt(limit, 10) || 50, 200) : 50;
    return this.auditLogService.findRecent({
      limit: limitNum,
      module,
      userId,
      action,
    });
  }
}
