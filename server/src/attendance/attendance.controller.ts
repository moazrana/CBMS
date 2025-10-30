import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark-attendance')
  @UseGuards(JwtAuthGuard)
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  findByStudent(@Param('studentId') studentId: string) {
    return this.attendanceService.findByStudent(studentId);
  }

  @Get('class/:classId')
  @UseGuards(JwtAuthGuard)
  findByClass(@Param('classId') classId: string) {
    return this.attendanceService.findByClass(classId);
  }

  @Get('staff/:staffId')
  @UseGuards(JwtAuthGuard)
  findByStaff(@Param('staffId') staffId: string) {
    return this.attendanceService.findByStaff(staffId);
  }

  @Get('date/:date')
  @UseGuards(JwtAuthGuard)
  findByDate(@Param('date') date: string) {
    return this.attendanceService.findByDate(date);
  }

  @Get('student/:studentId/date/:date')
  @UseGuards(JwtAuthGuard)
  findByStudentAndDate(@Param('studentId') studentId: string, @Param('date') date: string) {
    return this.attendanceService.findByStudentAndDate(studentId, date);
  }

  @Get('class/:classId/date/:date')
  @UseGuards(JwtAuthGuard)
  findByClassAndDate(@Param('classId') classId: string, @Param('date') date: string) {
    return this.attendanceService.findByClassAndDate(classId, date);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }

  @Get('stats/monthly')
  @UseGuards(JwtAuthGuard)
  async getMonthlyStats(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year) : undefined;
    return this.attendanceService.getMonthlyAttendanceStats(yearNumber);
  }
}
