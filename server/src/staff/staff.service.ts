import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  User,
  UserDocument,
  StaffProfile,
  EmergencyContact,
  DBS,
  TrainingRecord,
  QualificationRecord,
  HRRecord,
  MedicalNeeds,
  DoctorContact,
} from '../users/schemas/user.schema';

const DEFAULT_STAFF_PASSWORD = 'P@ssword';
const DEFAULT_STAFF_PIN = '123';
const STAFF_ROLE_NAME = 'Staff';

type TrainingRecordInput = {
  courseName: string;
  dateCompleted?: string;
  expiryDate?: string;
  status?: string;
  notes?: string;
  uploadCertificate?: string;
};

type QualificationRecordInput = {
  qualificationName: string;
  qualificationType?: string;
  classOfDegree?: string;
  achievedDate?: string;
  expiryDate?: string;
  subject1?: string;
  subject2?: string;
  qtStatus?: string;
  nqtEctStatus?: string;
  npqhQualification?: boolean;
  ccrsQualification?: boolean;
  notes?: string;
  uploadQualificationEvidence?: string;
};

type HRRecordInput = {
  absenceType?: string;
  absenceDate?: string;
  reason?: string;
  evidenceUpload?: string;
};

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
  ) {}

  private buildDisplayName(dto: CreateStaffDto | UpdateStaffDto, existing?: StaffProfile): string | undefined {
    if (dto.preferredName) {
      return dto.preferredName.trim();
    }

    const firstName = dto.firstName ?? existing?.firstName;
    const lastName = dto.lastName ?? existing?.lastName;

    if (!firstName && !existing?.firstName) {
      return undefined;
    }

    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ').trim();
  }


  private async resolveCheckedByUser(
    userId?: string,
  ): Promise<{ _id: Types.ObjectId; name: string } | undefined> {
    if (!userId || userId === 'undefined' || userId === 'null') {
      return undefined;
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid checked-by user identifier');
    }

    const user = await this.userModel.findById(userId).select('name').lean();

    if (!user) {
      throw new NotFoundException('Checked-by user not found');
    }

    return {
      _id: new Types.ObjectId(user._id),
      name: user.name,
    };
  }

  private async mapRightToWorkData(
    source?: {
      type?: string;
      verifiedDate?: string;
      verifiedByUserId?: string;
      expiry?: string;
      evidence?: string;
    },
    existing?: DBS['rightToWork'],
  ): Promise<DBS['rightToWork'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['rightToWork'] = { ...(existing || {}) };

    if (source.type !== undefined) {
      result.type = source.type;
    }
    if (source.verifiedDate !== undefined) {
      result.verifiedDate = source.verifiedDate ? new Date(source.verifiedDate) : undefined;
    }
    if (source.verifiedByUserId !== undefined && source.verifiedByUserId !== 'undefined' && source.verifiedByUserId !== 'null') {
      result.verifiedBy = await this.resolveCheckedByUser(source.verifiedByUserId);
    }
    if (source.expiry !== undefined) {
      result.expiry = source.expiry ? new Date(source.expiry) : undefined;
    }
    if (source.evidence !== undefined) {
      result.evidence = source.evidence;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private async mapOverseasData(
    source?: {
      checkNeeded?: boolean;
      evidenceProduced?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
      uploadEvidence?: string;
    },
    existing?: DBS['overseas'],
  ): Promise<DBS['overseas'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['overseas'] = { ...(existing || {}) };

    if (source.checkNeeded !== undefined) {
      result.checkNeeded = source.checkNeeded;
    }
    if (source.evidenceProduced !== undefined) {
      result.evidenceProduced = source.evidenceProduced;
    }
    if (source.checkDate !== undefined) {
      result.checkDate = source.checkDate ? new Date(source.checkDate) : undefined;
    }
    if (source.checkedByUserId !== undefined && source.checkedByUserId !== 'undefined' && source.checkedByUserId !== 'null') {
      result.checkedBy = await this.resolveCheckedByUser(source.checkedByUserId);
    }
    if (source.uploadEvidence !== undefined) {
      result.uploadEvidence = source.uploadEvidence;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private async mapChildrenBarredListData(
    source?: {
      completed?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
    },
    existing?: DBS['childrenBarredListCheck'],
  ): Promise<DBS['childrenBarredListCheck'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['childrenBarredListCheck'] = { ...(existing || {}) };

    if (source.completed !== undefined) {
      result.completed = source.completed;
    }
    if (source.checkDate !== undefined) {
      result.checkDate = source.checkDate ? new Date(source.checkDate) : undefined;
    }
    if (source.checkedByUserId !== undefined && source.checkedByUserId !== 'undefined' && source.checkedByUserId !== 'null') {
      result.checkedBy = await this.resolveCheckedByUser(source.checkedByUserId);
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private async mapProhibitionFromTeachingData(
    source?: {
      checked?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
    },
    existing?: DBS['prohibitionFromTeaching'],
  ): Promise<DBS['prohibitionFromTeaching'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['prohibitionFromTeaching'] = { ...(existing || {}) };

    if (source.checked !== undefined) {
      result.checked = source.checked;
    }
    if (source.checkDate !== undefined) {
      result.checkDate = source.checkDate ? new Date(source.checkDate) : undefined;
    }
    if (source.checkedByUserId !== undefined && source.checkedByUserId !== 'undefined' && source.checkedByUserId !== 'null') {
      result.checkedBy = await this.resolveCheckedByUser(source.checkedByUserId);
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private async mapProhibitionFromManagementData(
    source?: {
      completed?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
      notes?: string;
    },
    existing?: DBS['prohibitionFromManagement'],
  ): Promise<DBS['prohibitionFromManagement'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['prohibitionFromManagement'] = { ...(existing || {}) };

    if (source.completed !== undefined) {
      result.completed = source.completed;
    }
    if (source.checkDate !== undefined) {
      result.checkDate = source.checkDate ? new Date(source.checkDate) : undefined;
    }
    if (source.checkedByUserId !== undefined && source.checkedByUserId !== 'undefined' && source.checkedByUserId !== 'null') {
      result.checkedBy = await this.resolveCheckedByUser(source.checkedByUserId);
    }
    if (source.notes !== undefined) {
      result.notes = source.notes;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private async mapDisqualificationUnderChildrenActData(
    source?: {
      completed?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
    },
    existing?: DBS['disqualificationUnderChildrenAct'],
  ): Promise<DBS['disqualificationUnderChildrenAct'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['disqualificationUnderChildrenAct'] = { ...(existing || {}) };

    if (source.completed !== undefined) {
      result.completed = source.completed;
    }
    if (source.checkDate !== undefined) {
      result.checkDate = source.checkDate ? new Date(source.checkDate) : undefined;
    }
    if (source.checkedByUserId !== undefined && source.checkedByUserId !== 'undefined' && source.checkedByUserId !== 'null') {
      result.checkedBy = await this.resolveCheckedByUser(source.checkedByUserId);
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private async mapDisqualifiedByAssociationData(
    source?: {
      completed?: boolean;
      checkedDate?: string;
      checkedByUserId?: string;
    },
    existing?: DBS['disqualifiedByAssociation'],
  ): Promise<DBS['disqualifiedByAssociation'] | undefined> {
    if (!source) {
      return existing;
    }

    const result: DBS['disqualifiedByAssociation'] = { ...(existing || {}) };

    if (source.completed !== undefined) {
      result.completed = source.completed;
    }
    if (source.checkedDate !== undefined) {
      result.checkedDate = source.checkedDate ? new Date(source.checkedDate) : undefined;
    }
    if (source.checkedByUserId !== undefined && source.checkedByUserId !== 'undefined' && source.checkedByUserId !== 'null') {
      result.checkedBy = await this.resolveCheckedByUser(source.checkedByUserId);
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private mapTrainingRecords(
    records?: TrainingRecordInput[],
  ): TrainingRecord[] | undefined {
    if (!records) {
      return undefined;
    }

    return records
      .filter((record) => record && record.courseName)
      .map((record) => ({
        courseName: record.courseName,
        dateCompleted: record.dateCompleted ? new Date(record.dateCompleted) : undefined,
        expiryDate: record.expiryDate ? new Date(record.expiryDate) : undefined,
        status: record.status,
        notes: record.notes,
        uploadCertificate: record.uploadCertificate,
      }));
  }

  private mapQualificationRecords(
    records?: QualificationRecordInput[],
  ): QualificationRecord[] | undefined {
    if (!records) {
      return undefined;
    }

    return records
      .filter((record) => record && record.qualificationName)
      .map((record) => ({
        qualificationName: record.qualificationName,
        qualificationType: record.qualificationType,
        classOfDegree: record.classOfDegree,
        achievedDate: record.achievedDate ? new Date(record.achievedDate) : undefined,
        expiryDate: record.expiryDate ? new Date(record.expiryDate) : undefined,
        subject1: record.subject1,
        subject2: record.subject2,
        qtStatus: record.qtStatus,
        nqtEctStatus: record.nqtEctStatus,
        npqhQualification: record.npqhQualification,
        ccrsQualification: record.ccrsQualification,
        notes: record.notes,
        uploadQualificationEvidence: record.uploadQualificationEvidence,
      }));
  }

  private mapHRRecords(
    records?: HRRecordInput[],
  ): HRRecord[] | undefined {
    if (!records) {
      return undefined;
    }

    return records.map((record) => ({
      absenceType: record.absenceType,
      absenceDate: record.absenceDate ? new Date(record.absenceDate) : undefined,
      reason: record.reason,
      evidenceUpload: record.evidenceUpload,
    }));
  }

  private mapMedicalNeeds(
    medicalNeeds?: CreateStaffDto['medicalNeeds'],
  ): MedicalNeeds | undefined {
    if (!medicalNeeds) {
      return undefined;
    }

    return {
      medicalDescription: medicalNeeds.medicalDescription,
      conditionsSyndrome: medicalNeeds.conditionsSyndrome,
      medication: medicalNeeds.medication,
      specialDiet: medicalNeeds.specialDiet,
      impairments: medicalNeeds.impairments,
      allergies: medicalNeeds.allergies,
      assistanceRequired: medicalNeeds.assistanceRequired,
      nhsNumber: medicalNeeds.nhsNumber,
      bloodGroup: medicalNeeds.bloodGroup,
      medicalNotes: medicalNeeds.medicalNotes,
      lastMedicalCheck: medicalNeeds.lastMedicalCheck ? new Date(medicalNeeds.lastMedicalCheck) : undefined,
      doctorContactDetails: medicalNeeds.doctorContactDetails?.map((contact) => ({
        name: contact.name,
        relationship: contact.relationship,
        mobile: contact.mobile,
        daytimePhone: contact.daytimePhone,
        eveningPhone: contact.eveningPhone,
        email: contact.email,
      })) as DoctorContact[],
    };
  }

  async create(createStaffDto: CreateStaffDto) {
    const displayName = this.buildDisplayName(createStaffDto);
    if (!displayName) {
      throw new BadRequestException('Unable to determine staff display name');
    }

    const userPayload: CreateUserDto = {
      name: displayName,
      email: createStaffDto.email,
      password: DEFAULT_STAFF_PASSWORD,
      pin: DEFAULT_STAFF_PIN,
      role: STAFF_ROLE_NAME,
    };

    let user;
    try {
      user = await this.usersService.create(userPayload);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to create staff user');
    }

    // Create staff profile and embed in user
    const staffProfile: StaffProfile = {
      firstName: createStaffDto.firstName,
      middleName: createStaffDto.middleName,
      lastName: createStaffDto.lastName,
      preferredName: createStaffDto.preferredName,
      jobRole: createStaffDto.jobRole,
      department: createStaffDto.department,
      startDate: createStaffDto.startDate ? new Date(createStaffDto.startDate) : undefined,
      endDate: createStaffDto.endDate ? new Date(createStaffDto.endDate) : undefined,
      phoneWork: createStaffDto.phoneWork,
      phoneMobile: createStaffDto.phoneMobile,
      address: createStaffDto.address,
    };

    user.profile = staffProfile;
    
    // Set emergency contacts if provided
    if (createStaffDto.emergencyContacts && createStaffDto.emergencyContacts.length > 0) {
      user.emergencyContacts = createStaffDto.emergencyContacts as EmergencyContact[];
    }

    const cpdTraining = this.mapTrainingRecords(createStaffDto.cpdTraining);
    if (cpdTraining && cpdTraining.length > 0) {
      user.cpdTraining = cpdTraining;
    }

    const safeguardingTraining = this.mapTrainingRecords(createStaffDto.safeguardingTraining);
    if (safeguardingTraining && safeguardingTraining.length > 0) {
      user.safeguardingTraining = safeguardingTraining;
    }

    const qualifications = this.mapQualificationRecords(createStaffDto.qualifications);
    if (qualifications && qualifications.length > 0) {
      user.qualifications = qualifications;
    }

    const hrRecords = this.mapHRRecords(createStaffDto.hr);
    if (hrRecords && hrRecords.length > 0) {
      user.hr = hrRecords;
    }

    const medicalNeeds = this.mapMedicalNeeds(createStaffDto.medicalNeeds);
    if (medicalNeeds) {
      user.medicalNeeds = medicalNeeds;
    }
    
    // Set DBS information if provided
    if (createStaffDto.dbs) {
      const dbsData: DBS = {
        staffMember: createStaffDto.dbs.staffMember,
        checkLevel: createStaffDto.dbs.checkLevel,
        applicationSentDate: createStaffDto.dbs.applicationSentDate ? new Date(createStaffDto.dbs.applicationSentDate) : undefined,
        applicationReferenceNumber: createStaffDto.dbs.applicationReferenceNumber,
        certificateDateReceived: createStaffDto.dbs.certificateDateReceived ? new Date(createStaffDto.dbs.certificateDateReceived) : undefined,
        certificateNumber: createStaffDto.dbs.certificateNumber,
        dbsSeenBy: createStaffDto.dbs.dbsSeenBy,
        dbsCheckedDate: createStaffDto.dbs.dbsCheckedDate ? new Date(createStaffDto.dbs.dbsCheckedDate) : undefined,
        updateServiceId: createStaffDto.dbs.updateServiceId,
        updateServiceCheckDate: createStaffDto.dbs.updateServiceCheckDate ? new Date(createStaffDto.dbs.updateServiceCheckDate) : undefined,
      };

      const rightToWork = await this.mapRightToWorkData(createStaffDto.dbs.rightToWork);
      if (rightToWork) {
        dbsData.rightToWork = rightToWork;
      }

      const overseas = await this.mapOverseasData(createStaffDto.dbs.overseas);
      if (overseas) {
        dbsData.overseas = overseas;
      }

      const childrenBarredListCheck = await this.mapChildrenBarredListData(
        createStaffDto.dbs.childrenBarredListCheck,
      );
      if (childrenBarredListCheck) {
        dbsData.childrenBarredListCheck = childrenBarredListCheck;
      }

      const prohibitionFromTeaching = await this.mapProhibitionFromTeachingData(
        createStaffDto.dbs.prohibitionFromTeaching,
      );
      if (prohibitionFromTeaching) {
        dbsData.prohibitionFromTeaching = prohibitionFromTeaching;
      }

      const prohibitionFromManagement = await this.mapProhibitionFromManagementData(
        createStaffDto.dbs.prohibitionFromManagement,
      );
      if (prohibitionFromManagement) {
        dbsData.prohibitionFromManagement = prohibitionFromManagement;
      }

      const disqualificationUnderChildrenAct =
        await this.mapDisqualificationUnderChildrenActData(
          createStaffDto.dbs.disqualificationUnderChildrenAct,
        );
      if (disqualificationUnderChildrenAct) {
        dbsData.disqualificationUnderChildrenAct = disqualificationUnderChildrenAct;
      }

      const disqualifiedByAssociation = await this.mapDisqualifiedByAssociationData(
        createStaffDto.dbs.disqualifiedByAssociation,
      );
      if (disqualifiedByAssociation) {
        dbsData.disqualifiedByAssociation = disqualifiedByAssociation;
      }

      user.dbs = dbsData;
    }
    
    await user.save();

    return this.findOne(user._id.toString());
  }

  async findAll() {
    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: '$role' },
      { 
        $match: { 
          'role.name': STAFF_ROLE_NAME,
          deletedAt: null,
          'profile.firstName': { $exists: true }
        }
      },
      {
        $project: {
          password: 0,
          pin: 0
        }
      }
    ]);
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid staff identifier');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password -pin')
      .populate('role', 'name')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    // Verify this is a staff member
    const role = user.role as any;
    if (!role || role.name !== STAFF_ROLE_NAME) {
      throw new NotFoundException('Staff member not found');
    }

    if (!user.profile || !(user.profile as StaffProfile).firstName) {
      throw new NotFoundException('Staff profile not found');
    }

    return user;
  }

  async findByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user identifier');
    }

    const user = await this.userModel
      .findById(userId)
      .select('-password -pin')
      .populate('role', 'name')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = user.role as any;
    if (!role || role.name !== STAFF_ROLE_NAME) {
      throw new NotFoundException('Staff member not found');
    }

    if (!user.profile || !(user.profile as StaffProfile).firstName) {
      throw new NotFoundException('Staff profile not found');
    }

    return user;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid staff identifier');
    }

    const user = await this.userModel.findById(id).populate('role');

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    // Verify this is a staff member
    const roleData = user.role as any;
    if (!roleData || roleData.name !== STAFF_ROLE_NAME) {
      throw new NotFoundException('Staff member not found');
    }

    const existingProfile = (user.profile as StaffProfile | undefined);

    // Update profile fields
    const profileUpdates: Partial<StaffProfile> = {
      ...(existingProfile || {}),
      ...(updateStaffDto.firstName !== undefined && { firstName: updateStaffDto.firstName }),
      ...(updateStaffDto.middleName !== undefined && { middleName: updateStaffDto.middleName }),
      ...(updateStaffDto.lastName !== undefined && { lastName: updateStaffDto.lastName }),
      ...(updateStaffDto.preferredName !== undefined && { preferredName: updateStaffDto.preferredName }),
      ...(updateStaffDto.jobRole !== undefined && { jobRole: updateStaffDto.jobRole }),
      ...(updateStaffDto.department !== undefined && { department: updateStaffDto.department }),
      ...(updateStaffDto.startDate && { startDate: new Date(updateStaffDto.startDate) }),
      ...(updateStaffDto.endDate && { endDate: new Date(updateStaffDto.endDate) }),
      ...(updateStaffDto.phoneWork !== undefined && { phoneWork: updateStaffDto.phoneWork }),
      ...(updateStaffDto.phoneMobile !== undefined && { phoneMobile: updateStaffDto.phoneMobile }),
      ...(updateStaffDto.address !== undefined && { address: updateStaffDto.address }),
    };

    // Update user email if provided
    if (updateStaffDto.email) {
      user.email = updateStaffDto.email;
    }

    // Update user display name if name fields changed
    const needsNameUpdate =
      updateStaffDto.firstName ||
      updateStaffDto.lastName ||
      updateStaffDto.preferredName;

    if (needsNameUpdate) {
      const displayName = this.buildDisplayName(updateStaffDto, existingProfile);
      if (displayName) {
        user.name = displayName;
      }
    }

    // Update profile
    user.profile = profileUpdates as StaffProfile;

    // Update emergency contacts if provided
    if (updateStaffDto.emergencyContacts !== undefined) {
      user.emergencyContacts = updateStaffDto.emergencyContacts as EmergencyContact[];
    }

    if (updateStaffDto.cpdTraining !== undefined) {
      user.cpdTraining = this.mapTrainingRecords(updateStaffDto.cpdTraining) ?? [];
    }

   
    if (updateStaffDto.qualifications !== undefined) {
      user.qualifications = this.mapQualificationRecords(updateStaffDto.qualifications) ?? [];
    }

    if (updateStaffDto.hr !== undefined) {
      user.hr = this.mapHRRecords(updateStaffDto.hr) ?? [];
    }

    if (updateStaffDto.medicalNeeds !== undefined) {
      user.medicalNeeds = this.mapMedicalNeeds(updateStaffDto.medicalNeeds) ?? {};
    }

    // Update DBS information if provided
    if (updateStaffDto.dbs !== undefined) {
      const dbsData: DBS = {
        ...(user.dbs || {}),
        ...(updateStaffDto.dbs.staffMember !== undefined && { staffMember: updateStaffDto.dbs.staffMember }),
        ...(updateStaffDto.dbs.checkLevel !== undefined && { checkLevel: updateStaffDto.dbs.checkLevel }),
        ...(updateStaffDto.dbs.applicationSentDate && { applicationSentDate: new Date(updateStaffDto.dbs.applicationSentDate) }),
        ...(updateStaffDto.dbs.applicationReferenceNumber !== undefined && { applicationReferenceNumber: updateStaffDto.dbs.applicationReferenceNumber }),
        ...(updateStaffDto.dbs.certificateDateReceived && { certificateDateReceived: new Date(updateStaffDto.dbs.certificateDateReceived) }),
        ...(updateStaffDto.dbs.certificateNumber !== undefined && { certificateNumber: updateStaffDto.dbs.certificateNumber }),
        ...(updateStaffDto.dbs.dbsSeenBy !== undefined && { dbsSeenBy: updateStaffDto.dbs.dbsSeenBy }),
        ...(updateStaffDto.dbs.dbsCheckedDate && { dbsCheckedDate: new Date(updateStaffDto.dbs.dbsCheckedDate) }),
        ...(updateStaffDto.dbs.updateServiceId !== undefined && { updateServiceId: updateStaffDto.dbs.updateServiceId }),
        ...(updateStaffDto.dbs.updateServiceCheckDate && { updateServiceCheckDate: new Date(updateStaffDto.dbs.updateServiceCheckDate) }),
      };

      if (updateStaffDto.dbs.rightToWork !== undefined) {
        const mappedRightToWork = await this.mapRightToWorkData(
          updateStaffDto.dbs.rightToWork,
          user.dbs?.rightToWork,
        );
        if (mappedRightToWork) {
          dbsData.rightToWork = mappedRightToWork;
        } else {
          delete dbsData.rightToWork;
        }
      }

      if (updateStaffDto.dbs.overseas !== undefined) {
        const mappedOverseas = await this.mapOverseasData(
          updateStaffDto.dbs.overseas,
          user.dbs?.overseas,
        );
        if (mappedOverseas) {
          dbsData.overseas = mappedOverseas;
        } else {
          delete dbsData.overseas;
        }
      }

      if (updateStaffDto.dbs.childrenBarredListCheck !== undefined) {
        const mappedChildrenBarredList = await this.mapChildrenBarredListData(
          updateStaffDto.dbs.childrenBarredListCheck,
          user.dbs?.childrenBarredListCheck,
        );
        if (mappedChildrenBarredList) {
          dbsData.childrenBarredListCheck = mappedChildrenBarredList;
        } else {
          delete dbsData.childrenBarredListCheck;
        }
      }

      if (updateStaffDto.dbs.prohibitionFromTeaching !== undefined) {
        const mappedProhibitionTeaching = await this.mapProhibitionFromTeachingData(
          updateStaffDto.dbs.prohibitionFromTeaching,
          user.dbs?.prohibitionFromTeaching,
        );
        if (mappedProhibitionTeaching) {
          dbsData.prohibitionFromTeaching = mappedProhibitionTeaching;
        } else {
          delete dbsData.prohibitionFromTeaching;
        }
      }

      if (updateStaffDto.dbs.prohibitionFromManagement !== undefined) {
        const mappedProhibitionManagement = await this.mapProhibitionFromManagementData(
          updateStaffDto.dbs.prohibitionFromManagement,
          user.dbs?.prohibitionFromManagement,
        );
        if (mappedProhibitionManagement) {
          dbsData.prohibitionFromManagement = mappedProhibitionManagement;
        } else {
          delete dbsData.prohibitionFromManagement;
        }
      }

      if (updateStaffDto.dbs.disqualificationUnderChildrenAct !== undefined) {
        const mappedDisqualificationChildrenAct =
          await this.mapDisqualificationUnderChildrenActData(
            updateStaffDto.dbs.disqualificationUnderChildrenAct,
            user.dbs?.disqualificationUnderChildrenAct,
          );
        if (mappedDisqualificationChildrenAct) {
          dbsData.disqualificationUnderChildrenAct = mappedDisqualificationChildrenAct;
        } else {
          delete dbsData.disqualificationUnderChildrenAct;
        }
      }

      if (updateStaffDto.dbs.disqualifiedByAssociation !== undefined) {
        const mappedDisqualifiedByAssociation = await this.mapDisqualifiedByAssociationData(
          updateStaffDto.dbs.disqualifiedByAssociation,
          user.dbs?.disqualifiedByAssociation,
        );
        if (mappedDisqualifiedByAssociation) {
          dbsData.disqualifiedByAssociation = mappedDisqualifiedByAssociation;
        } else {
          delete dbsData.disqualifiedByAssociation;
        }
      }

      user.dbs = dbsData;
    }

    try {
      await user.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Email already in use');
      }
      throw new BadRequestException(error.message || 'Unable to update staff member');
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid staff identifier');
    }

    const user = await this.userModel.findById(id).populate('role');

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    // Verify this is a staff member
    const roleData = user.role as any;
    if (!roleData || roleData.name !== STAFF_ROLE_NAME) {
      throw new NotFoundException('Staff member not found');
    }

    await this.usersService.remove(id);

    return { success: true };
  }
}

