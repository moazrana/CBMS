import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('staff')
export class StaffController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':staffId/students')
  @UseGuards(JwtAuthGuard)
  async getStaffStudents(@Param('staffId') staffId: string) {
    return this.usersService.getTeacherStudents(staffId);
  }
}
