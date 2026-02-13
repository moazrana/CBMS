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
import { SubmitEngagementDto } from './dto/submit-engagement.dto';

@Controller('engagements')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post()
  create(@Body() createEngagementDto: CreateEngagementDto) {
    return this.engagementService.create(createEngagementDto);
  }

  @Post('submit')
  submit(@Body() dto: SubmitEngagementDto) {
    return this.engagementService.submitEngagementsForStudent(
      dto.classId,
      dto.studentId,
      dto.engagementDate,
    );
  }

  @Get()
  async findAll(
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
      return this.engagementService.findMarkedEngagements(sortField, sortOrder, pageNum, perPageNum);
    }
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
    @Query('marked') marked?: string,
  ) {
    if (marked === 'true') {
      return this.engagementService.findByClassMarked(classId, engagementDate);
    }
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

