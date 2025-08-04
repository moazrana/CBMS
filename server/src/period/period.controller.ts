import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PeriodService } from './period.service';
import { Period, PeriodDocument } from './period.schema';

@Controller('periods')
export class PeriodController {
  constructor(private readonly periodService: PeriodService) {}

  @Post()
  create(@Body() data: Partial<Period>) {
    return this.periodService.create(data);
  }

  @Get()
  findAll() {
    return this.periodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Period>) {
    return this.periodService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodService.remove(id);
  }
} 