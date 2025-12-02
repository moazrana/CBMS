import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/role.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  async findAllStaff() {
    return this.staffService.findAll();
  }
  
  @Patch(':id')
  async updateStaff(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    console.log('updateStaffDto', updateStaffDto);
    return this.staffService.update(id, updateStaffDto);
  }

  @Get(':id')
  async findStaffById(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }


  @Delete(':id')
  async removeStaff(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  @Get(':staffId/students')
  async getStaffStudents(@Param('staffId') staffId: string) {
    return this.usersService.getTeacherStudents(staffId);
  }
}
