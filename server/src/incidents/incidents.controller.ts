import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { IncidentsService } from './incidents.service';
import { Incident } from './schemas/incident.schema';

function editFileName(req, file, callback) {
  const name = file.originalname.split('.')[0];
  const fileExtName = file.originalname.split('.').pop();
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  callback(null, `${name}-${uniqueSuffix}.${fileExtName}`);
}

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '../../uploads/incidents'),
      filename: editFileName,
    })
  }))
  async create(
    @Body() data: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // If a file is uploaded, add its info to the data object
    if (file) {
      data.fileName = file.originalname;
      data.filePath = file.path;
      data.fileType = file.mimetype;
      data.fileSize = file.size;
    }
    if (typeof data.meetings === 'string') {
      data.meetings = JSON.parse(data.meetings);
    }
    if (typeof data.conclusion === 'string') {
      data.conclusion = JSON.parse(data.conclusion);
    }
    return this.incidentsService.create(data);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '../../uploads/incidents'),
      filename: editFileName,
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Incident>,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      data.fileName = file.originalname;
      data.filePath = file.path;
      data.fileType = file.mimetype;
      data.fileSize = file.size;
    }
    if (typeof data.meetings === 'string') {
      data.meetings = JSON.parse(data.meetings);
    }
    if (typeof data.conclusion === 'string') {
      data.conclusion = JSON.parse(data.conclusion);
    }
    return this.incidentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
} 