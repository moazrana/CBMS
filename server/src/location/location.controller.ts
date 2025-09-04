import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from './location.schema';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() data: Partial<Location>) {
    return this.locationService.create(data);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Location>) {
    return this.locationService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
} 