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
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(
    @Body()
    body: CreateScheduleDto | { schedules: CreateScheduleDto[] },
  ) {
    if (Array.isArray((body as { schedules?: CreateScheduleDto[] }).schedules)) {
      return this.scheduleService.createMany((body as { schedules: CreateScheduleDto[] }).schedules);
    }
    return this.scheduleService.create(body as CreateScheduleDto);
  }

  @Get()
  findAll(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('class') classId?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const sortField = sort || 'createdAt';
    const sortOrder = order || 'DESC';
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 10;
    return this.scheduleService.findAll(sortField, sortOrder, classId, pageNum, perPageNum);
  }

  @Get('timetable')
  findForTimetable(
    @Query('class') classId?: string,
    @Query('perPage') perPage?: string,
  ) {
    const perPageNum = perPage ? parseInt(perPage, 10) : 1000;
    return this.scheduleService.findForTimetable(classId, perPageNum);
  }

  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.scheduleService.findByClass(classId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete('class/:classId')
  removeByClass(@Param('classId') classId: string) {
    return this.scheduleService.removeByClass(classId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
