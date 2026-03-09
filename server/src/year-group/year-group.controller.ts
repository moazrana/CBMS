import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { YearGroupService } from './year-group.service';
import { YearGroup } from './year-group.schema';

@Controller('year-groups')
export class YearGroupController {
  constructor(private readonly yearGroupService: YearGroupService) {}

  @Post()
  create(@Body() data: { name: string }) {
    return this.yearGroupService.create(data);
  }

  @Get()
  findAll() {
    return this.yearGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.yearGroupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.yearGroupService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.yearGroupService.remove(id);
  }
}
