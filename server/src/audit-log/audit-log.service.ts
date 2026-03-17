import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from './audit-log.schema';

export interface CreateAuditLogParams {
  action: AuditAction;
  module: string;
  recordId?: string;
  userId?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(params: CreateAuditLogParams): Promise<AuditLog> {
    const { action, module, recordId, userId, details } = params;
    const doc = new this.auditLogModel({
      action,
      module,
      ...(recordId && { recordId }),
      ...(userId && { userId: new Types.ObjectId(userId) }),
      ...(details && Object.keys(details).length > 0 && { details }),
    });
    return doc.save();
  }

  async logRoleAssignment(params: {
    targetUserRecordId: string;
    roleName: string;
    performedBy: string;
  }): Promise<AuditLog> {
    return this.log({
      action: 'role_assignment',
      module: 'users',
      recordId: params.targetUserRecordId,
      userId: params.performedBy,
      details: { roleName: params.roleName },
    });
  }

  async logRecordEdit(params: {
    action: 'create' | 'update' | 'delete';
    module: string;
    recordId: string;
    performedBy?: string;
    details?: Record<string, unknown>;
  }): Promise<AuditLog> {
    return this.log({
      action: params.action,
      module: params.module,
      recordId: params.recordId,
      userId: params.performedBy,
      details: params.details,
    });
  }

  async logIncidentSubmission(params: {
    recordId: string;
    performedBy?: string;
    isUpdate?: boolean;
    changes?: Record<string, { from: unknown; to: unknown }>;
  }): Promise<AuditLog> {
    return this.log({
      action: 'incident_submission',
      module: 'incidents',
      recordId: params.recordId,
      userId: params.performedBy,
      details: params.isUpdate
        ? { type: 'update', ...(params.changes && { changes: params.changes }) }
        : { type: 'create' },
    });
  }

  async findRecent(params: {
    limit?: number;
    module?: string;
    userId?: string;
    action?: AuditAction;
  }): Promise<AuditLog[]> {
    const filter: Record<string, unknown> = {};
    if (params.module) filter.module = params.module;
    if (params.userId) filter.userId = new Types.ObjectId(params.userId);
    if (params.action) filter.action = params.action;
    return this.auditLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(params.limit ?? 50)
      .populate('userId', 'name email')
      .lean()
      .exec();
  }
}
