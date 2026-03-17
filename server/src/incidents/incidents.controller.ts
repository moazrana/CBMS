import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UploadedFiles, UseInterceptors, Res, Request, NotFoundException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { Response } from 'express';
import { IncidentsService } from './incidents.service';
import { Incident } from './schemas/incident.schema';
import { parseIncidentBody } from './parse-incident-body';
import { AuditLogService } from '../audit-log/audit-log.service';
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
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
    @Request() req?: { user?: { _id: string } },
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

    const created = await this.incidentsService.create(data);
    await this.auditLogService.logIncidentSubmission({
      recordId: String(created._id),
      performedBy: req?.user?._id,
      isUpdate: false,
    });
    return created;
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
    @Request() req?: { user?: { _id: string } },
  ) {
    const data = parseIncidentBody(body) as Partial<Incident>;
    const existing = await this.incidentsService.findOne(id);

    const deepNormalize = (v: any): any => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      if (v instanceof Date) return v.toISOString();
      if (Array.isArray(v)) return v.map(deepNormalize);
      if (typeof v === 'object') {
        // Mongoose ObjectId
        if ((v as any)?._bsontype === 'ObjectId' && typeof (v as any).toString === 'function') {
          return String(v);
        }
        // populated doc / subdoc
        if ('_id' in v && (typeof (v as any)._id === 'string' || (v as any)._id?._bsontype === 'ObjectId')) {
          return String((v as any)._id);
        }
        const out: Record<string, any> = {};
        for (const [k, val] of Object.entries(v)) {
          // ignore mongoose internals
          if (k === '__v') continue;
          out[k] = deepNormalize(val);
        }
        return out;
      }
      return v;
    };

    const computeChanges = (beforeDoc: any, patch: Record<string, any>) => {
      const beforeRaw = typeof beforeDoc?.toObject === 'function' ? beforeDoc.toObject() : beforeDoc;
      const before = deepNormalize(beforeRaw);
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      for (const key of Object.keys(patch)) {
        const toVal = patch[key];
        if (toVal === undefined) continue;
        const fromVal = (beforeRaw as any)?.[key];
        const fromNorm = deepNormalize(fromVal);
        const toNorm = deepNormalize(toVal);
        const same = JSON.stringify(fromNorm) === JSON.stringify(toNorm);
        if (!same) changes[key] = { from: fromNorm, to: toNorm };
      }
      return changes;
    };

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

    const updated = await this.incidentsService.update(id, data);
    await this.auditLogService.logIncidentSubmission({
      recordId: id,
      performedBy: req?.user?._id,
      isUpdate: true,
      changes: computeChanges(existing as any, data as any),
    });
    return updated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
} 