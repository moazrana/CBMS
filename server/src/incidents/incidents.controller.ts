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
        { name: 'noteFiles', maxCount: 50 },
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
      const noteFileCountsRaw = body.noteFileCounts;
      let noteFileCounts: number[] = [];
      if (typeof noteFileCountsRaw === 'string') {
        try {
          noteFileCounts = JSON.parse(noteFileCountsRaw);
        } catch {
          noteFileCounts = data.meetings.map(() => 0);
        }
      }
      if (!Array.isArray(noteFileCounts) || noteFileCounts.length !== data.meetings.length) {
        noteFileCounts = data.meetings.map(() => 0);
      }
      let fileIdx = 0;
      data.meetings = data.meetings.map((meeting: any, i: number) => {
        const count = Math.max(0, Math.min(noteFileCounts[i] ?? 0, files.noteFiles.length - fileIdx));
        const newFiles = files.noteFiles.slice(fileIdx, fileIdx + count).map((f: Express.Multer.File) => ({
          fileName: f.originalname,
          filePath: f.path,
          fileType: f.mimetype,
          fileSize: f.size,
        }));
        fileIdx += count;
        const existing = meeting.noteFiles ?? [];
        const legacy = meeting.fileName ? [{ fileName: meeting.fileName, filePath: meeting.filePath, fileType: meeting.fileType, fileSize: meeting.fileSize }] : [];
        const combined = existing.length ? existing : legacy;
        return { ...meeting, noteFiles: [...combined, ...newFiles], fileName: undefined, filePath: undefined, fileType: undefined, fileSize: undefined };
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

  @Get(':id/note-files/:meetingIndex/:fileIndex')
  async getNoteFile(
    @Param('id') id: string,
    @Param('meetingIndex') meetingIndex: string,
    @Param('fileIndex') fileIndex: string,
    @Res() res: Response,
  ) {
    const incident = await this.incidentsService.findOne(id);
    const mIdx = parseInt(meetingIndex, 10);
    const fIdx = parseInt(fileIndex, 10);
    const meetings = incident.meetings ?? [];
    if (isNaN(mIdx) || mIdx < 0 || mIdx >= meetings.length) throw new NotFoundException('File not found');
    const meeting = meetings[mIdx] as any;
    const list = meeting?.noteFiles ?? (meeting?.filePath ? [{ fileName: meeting.fileName, filePath: meeting.filePath, fileType: meeting.fileType, fileSize: meeting.fileSize }] : []);
    if (isNaN(fIdx) || fIdx < 0 || fIdx >= list.length) throw new NotFoundException('File not found');
    const file = list[fIdx];
    if (!file?.filePath || !fs.existsSync(file.filePath)) throw new NotFoundException('File not found');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.sendFile(file.filePath);
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
        { name: 'noteFiles', maxCount: 50 },
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
      const noteFileCountsRaw = body.noteFileCounts;
      let noteFileCounts: number[] = [];
      if (typeof noteFileCountsRaw === 'string') {
        try {
          noteFileCounts = JSON.parse(noteFileCountsRaw);
        } catch {
          noteFileCounts = data.meetings.map(() => 0);
        }
      }
      if (!Array.isArray(noteFileCounts) || noteFileCounts.length !== data.meetings.length) {
        noteFileCounts = data.meetings.map(() => 0);
      }
      let fileIdx = 0;
      data.meetings = data.meetings.map((meeting: any, i: number) => {
        const count = Math.max(0, Math.min(noteFileCounts[i] ?? 0, files.noteFiles.length - fileIdx));
        const newFiles = files.noteFiles.slice(fileIdx, fileIdx + count).map((f: Express.Multer.File) => ({
          fileName: f.originalname,
          filePath: f.path,
          fileType: f.mimetype,
          fileSize: f.size,
        }));
        fileIdx += count;
        const existingMeeting = existing.meetings?.[i] as any;
        const existingList = existingMeeting?.noteFiles ?? (existingMeeting?.filePath ? [{ fileName: existingMeeting.fileName, filePath: existingMeeting.filePath, fileType: existingMeeting.fileType, fileSize: existingMeeting.fileSize }] : []);
        const incomingExisting = meeting?.noteFiles ?? [];
        const combined = (Array.isArray(incomingExisting) && incomingExisting.length) ? incomingExisting : existingList;
        return { ...meeting, noteFiles: [...combined, ...newFiles], fileName: undefined, filePath: undefined, fileType: undefined, fileSize: undefined };
      });
    }

    return this.incidentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
} 