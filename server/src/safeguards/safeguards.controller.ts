import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { SafeguardsService } from './safeguards.service';
import { Safeguard } from './schemas/safeguard.schema';

function editFileName(req, file, callback) {
  const name = file.originalname.split('.')[0];
  const fileExtName = file.originalname.split('.').pop();
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  callback(null, `${name}-${uniqueSuffix}.${fileExtName}`);
}

@Controller('safeguards')
export class SafeguardsController {
  constructor(private readonly safeguardsService: SafeguardsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '../../uploads/safeguards'),
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
    return this.safeguardsService.create(data);
  }

  @Get()
  findAll() {
    return this.safeguardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.safeguardsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '../../uploads/safeguards'),
      filename: editFileName,
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Safeguard>,
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
    return this.safeguardsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.safeguardsService.remove(id);
  }
} 