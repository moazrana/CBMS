import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CreateEngagementDto } from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';

@Controller('engagements')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post()
  create(@Body() createEngagementDto: CreateEngagementDto) {
    return this.engagementService.create(createEngagementDto);
  }

  @Get()
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
    return this.engagementService.findAll(sortField, sortOrder, searchTerm, pageNum, perPageNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.engagementService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEngagementDto: UpdateEngagementDto) {
    return this.engagementService.update(id, updateEngagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.engagementService.remove(id);
  }

  @Get('class/:classId')
  findByClass(
    @Param('classId') classId: string,
    @Query('date') engagementDate?: string,
  ) {
    return this.engagementService.findByClass(classId, engagementDate);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.engagementService.findByStudent(studentId);
  }

  @Get('class/:classId/student/:studentId')
  findByClassAndStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.engagementService.findByClassAndStudent(classId, studentId);
  }

  @Get('class/:classId/student/:studentId/session/:session')
  findByClassStudentAndSession(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Param('session') session: string,
    @Query('date') engagementDate?: string,
  ) {
    return this.engagementService.findByClassStudentAndSession(classId, studentId, session, engagementDate);
  }
}

