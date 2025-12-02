import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/role.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  async findAllStudents() {
    return this.studentsService.findAll();
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
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  async removeStudent(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Delete(':id/hard')
  async hardDeleteStudent(@Param('id') id: string) {
    return this.studentsService.hardDelete(id);
  }
}

