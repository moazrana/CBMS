import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UploadedFiles, UseInterceptors, Res, NotFoundException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { Response } from 'express';
import { IncidentsService } from './incidents.service';
import { Incident } from './schemas/incident.schema';
import { parseIncidentBody } from './parse-incident-body';
import * as fs from 'fs';

const incidentsUploadDir = join(__dirname, '../../uploads/incidents');

function editFileName(req, file, callback) {
  const name = file.originalname.split('.')[0];
  const fileExtName = file.originalname.split('.').pop();
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  callback(null, `${name}-${uniqueSuffix}.${fileExtName}`);
}

const multerOpts = {
  storage: diskStorage({
    destination: incidentsUploadDir,
    filename: editFileName,
  }),
};

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'descriptionFiles', maxCount: 20 },
        { name: 'restrainFiles', maxCount: 20 },
        { name: 'noteFiles', maxCount: 20 },
      ],
      multerOpts,
    ),
  )
  async create(
    @Body() body: Record<string, any>,
    @UploadedFiles()
    files?: {
      file?: Express.Multer.File[];
      descriptionFiles?: Express.Multer.File[];
      restrainFiles?: Express.Multer.File[];
      noteFiles?: Express.Multer.File[];
    },
  ) {
    const data = parseIncidentBody(body);

    if (files?.file?.[0]) {
      const file = files.file[0];
      data.fileName = file.originalname;
      data.filePath = file.path;
      data.fileType = file.mimetype;
      data.fileSize = file.size;
    }

    if (files?.descriptionFiles?.length) {
      data.descriptionFiles = files.descriptionFiles.map((f) => ({
        fileName: f.originalname,
        filePath: f.path,
        fileType: f.mimetype,
        fileSize: f.size,
      }));
    }

    if (files?.restrainFiles?.length) {
      data.restrainFiles = files.restrainFiles.map((f) => ({
        fileName: f.originalname,
        filePath: f.path,
        fileType: f.mimetype,
        fileSize: f.size,
      }));
    }

    if (files?.noteFiles?.length && Array.isArray(data.meetings)) {
      files.noteFiles.forEach((f, i) => {
        if (data.meetings[i]) {
          data.meetings[i] = {
            ...data.meetings[i],
            fileName: f.originalname,
            filePath: f.path,
            fileType: f.mimetype,
            fileSize: f.size,
          };
        }
      });
    }

    return this.incidentsService.create(data);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get('by-student/:studentId')
  findByStudentId(@Param('studentId') studentId: string) {
    return this.incidentsService.findByStudentId(studentId);
  }

  @Get('by-staff/:staffId')
  findByStaffId(@Param('staffId') staffId: string) {
    return this.incidentsService.findByStaffId(staffId);
  }

  @Get(':id/description-files/:index')
  async getDescriptionFile(
    @Param('id') id: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const incident = await this.incidentsService.findOne(id);
    const idx = parseInt(index, 10);
    const files = incident.descriptionFiles ?? [];
    if (isNaN(idx) || idx < 0 || idx >= files.length) throw new NotFoundException('File not found');
    const file = files[idx];
    if (!file?.filePath || !fs.existsSync(file.filePath)) throw new NotFoundException('File not found');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.sendFile(file.filePath);
  }

  @Get(':id/restrain-files/:index')
  async getRestrainFile(
    @Param('id') id: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const incident = await this.incidentsService.findOne(id);
    const idx = parseInt(index, 10);
    const files = incident.restrainFiles ?? [];
    if (isNaN(idx) || idx < 0 || idx >= files.length) throw new NotFoundException('File not found');
    const file = files[idx];
    if (!file?.filePath || !fs.existsSync(file.filePath)) throw new NotFoundException('File not found');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.sendFile(file.filePath);
  }

  @Get(':id/note-files/:index')
  async getNoteFile(
    @Param('id') id: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const incident = await this.incidentsService.findOne(id);
    const idx = parseInt(index, 10);
    const meetings = incident.meetings ?? [];
    if (isNaN(idx) || idx < 0 || idx >= meetings.length) throw new NotFoundException('File not found');
    const meeting = meetings[idx];
    if (!meeting?.filePath || !fs.existsSync(meeting.filePath)) throw new NotFoundException('File not found');
    res.setHeader('Content-Disposition', `attachment; filename="${meeting.fileName}"`);
    res.sendFile(meeting.filePath);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'descriptionFiles', maxCount: 20 },
        { name: 'restrainFiles', maxCount: 20 },
        { name: 'noteFiles', maxCount: 20 },
      ],
      multerOpts,
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @UploadedFiles()
    files?: {
      file?: Express.Multer.File[];
      descriptionFiles?: Express.Multer.File[];
      restrainFiles?: Express.Multer.File[];
      noteFiles?: Express.Multer.File[];
    },
  ) {
    const data = parseIncidentBody(body) as Partial<Incident>;
    const existing = await this.incidentsService.findOne(id);

    if (files?.file?.[0]) {
      const file = files.file[0];
      data.fileName = file.originalname;
      data.filePath = file.path;
      data.fileType = file.mimetype;
      data.fileSize = file.size;
    }

    if (files?.descriptionFiles?.length) {
      const newFiles = files.descriptionFiles.map((f) => ({
        fileName: f.originalname,
        filePath: f.path,
        fileType: f.mimetype,
        fileSize: f.size,
      }));
      data.descriptionFiles = [...(existing.descriptionFiles ?? []), ...newFiles];
    }

    if (files?.restrainFiles?.length) {
      const newFiles = files.restrainFiles.map((f) => ({
        fileName: f.originalname,
        filePath: f.path,
        fileType: f.mimetype,
        fileSize: f.size,
      }));
      data.restrainFiles = [...(existing.restrainFiles ?? []), ...newFiles];
    }

    if (files?.noteFiles?.length && Array.isArray(data.meetings)) {
      files.noteFiles.forEach((f, i) => {
        if (data.meetings[i]) {
          data.meetings[i] = {
            ...data.meetings[i],
            fileName: f.originalname,
            filePath: f.path,
            fileType: f.mimetype,
            fileSize: f.size,
          };
        }
      });
    }

    return this.incidentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
} 