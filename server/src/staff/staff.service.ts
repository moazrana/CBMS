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
    source?: any,
    existing?: DBS['rightToWork'],
  ): Promise<DBS['rightToWork'] | undefined> {
    //console.log('source$$$$$$', source);
    if (!source) {
      return existing;
    }

    const result: DBS['rightToWork'] = { ...(existing || {}) };

    if (source.type !== undefined) {
      //console.log('source.type$$$$$$', source.type);
      result.type = source.type;
    }
    if (source.verifiedDate !== undefined) {
      //console.log('source.verifiedDate$$$$$$', source.verifiedDate);
      result.verifiedDate = source.verifiedDate ? new Date(source.verifiedDate) : undefined;
    }
    if (source.verifiedByUserId !== undefined && source.verifiedByUserId !== 'undefined' && source.verifiedByUserId !== 'null') {
      //console.log('verifiedByUserId$$$$$$', source.verifiedByUserId);
      result.verifiedBy = await this.resolveCheckedByUser(source.verifiedByUserId);
    }
    if (source.expiry !== undefined) {
      //console.log('source.expiry$$$$$$', source.expiry);
      result.expiry = source.expiry ? new Date(source.expiry) : undefined;
    }
    if (source.evidence !== undefined) {
      //console.log('source.evidence$$$$$$', source.evidence);
      result.evidence = source.evidence;
    }

    //console.log('result$$$$$$', result);
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

  private async mapDBSDtoToDBS(dbsDto: any): Promise<DBS> {
    const dbsData: DBS = {
      staffMember: dbsDto.staffMember,
      checkLevel: dbsDto.checkLevel,
      applicationSentDate: dbsDto.applicationSentDate ? new Date(dbsDto.applicationSentDate) : undefined,
      applicationReferenceNumber: dbsDto.applicationReferenceNumber,
      certificateDateReceived: dbsDto.certificateDateReceived ? new Date(dbsDto.certificateDateReceived) : undefined,
      certificateNumber: dbsDto.certificateNumber,
      dbsSeenBy: dbsDto.dbsSeenBy,
      dbsCheckedDate: dbsDto.dbsCheckedDate ? new Date(dbsDto.dbsCheckedDate) : undefined,
      updateServiceId: dbsDto.updateServiceId,
      updateServiceCheckDate: dbsDto.updateServiceCheckDate ? new Date(dbsDto.updateServiceCheckDate) : undefined,
    };
    //console.log('here1')
    const rightToWork = await this.mapRightToWorkData(dbsDto.rightToWork);
    // //console.log('rightToWork', rightToWork);
    if (rightToWork) {
      dbsData.rightToWork = rightToWork;
    }

    const overseas = await this.mapOverseasData(dbsDto.overseas);
    if (overseas) {
      dbsData.overseas = overseas;
    }

    const childrenBarredListCheck = await this.mapChildrenBarredListData(
      dbsDto.childrenBarredListCheck,
    );
    if (childrenBarredListCheck) {
      dbsData.childrenBarredListCheck = childrenBarredListCheck;
    }

    const prohibitionFromTeaching = await this.mapProhibitionFromTeachingData(
      dbsDto.prohibitionFromTeaching,
    );
    if (prohibitionFromTeaching) {
      dbsData.prohibitionFromTeaching = prohibitionFromTeaching;
    }

    const prohibitionFromManagement = await this.mapProhibitionFromManagementData(
      dbsDto.prohibitionFromManagement,
    );
    if (prohibitionFromManagement) {
      dbsData.prohibitionFromManagement = prohibitionFromManagement;
    }

    const disqualificationUnderChildrenAct =
      await this.mapDisqualificationUnderChildrenActData(
        dbsDto.disqualificationUnderChildrenAct,
      );
    if (disqualificationUnderChildrenAct) {
      dbsData.disqualificationUnderChildrenAct = disqualificationUnderChildrenAct;
    }

    const disqualifiedByAssociation = await this.mapDisqualifiedByAssociationData(
      dbsDto.disqualifiedByAssociation,
    );
    if (disqualifiedByAssociation) {
      dbsData.disqualifiedByAssociation = disqualifiedByAssociation;
    }

    return dbsData;
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
    if (createStaffDto.dbs && createStaffDto.dbs.length > 0) {
      const dbsArray: DBS[] = [];
      for (const dbsDto of createStaffDto.dbs) {
        const dbsData = await this.mapDBSDtoToDBS(dbsDto);
        dbsArray.push(dbsData);
      }
      user.dbs = dbsArray;
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
    // //console.log('here1');
    // //console.log('updateStaffDto', updateStaffDto.dbs[0].rightToWork);
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

    // Update profile fields - use markModified for nested objects
    if (!user.profile) {
      user.profile = {} as StaffProfile;
    }

    const profile = user.profile as StaffProfile;

    // Update individual profile fields
    if (updateStaffDto.firstName !== undefined) {
      profile.firstName = updateStaffDto.firstName;
    }
    if (updateStaffDto.middleName !== undefined) {
      profile.middleName = updateStaffDto.middleName;
    }
    if (updateStaffDto.lastName !== undefined) {
      profile.lastName = updateStaffDto.lastName;
    }
    if (updateStaffDto.preferredName !== undefined) {
      profile.preferredName = updateStaffDto.preferredName;
    }
    if (updateStaffDto.jobRole !== undefined) {
      profile.jobRole = updateStaffDto.jobRole;
    }
    if (updateStaffDto.department !== undefined) {
      profile.department = updateStaffDto.department;
    }
    if (updateStaffDto.startDate !== undefined) {
      profile.startDate = updateStaffDto.startDate ? new Date(updateStaffDto.startDate) : undefined;
    }
    if (updateStaffDto.endDate !== undefined) {
      profile.endDate = updateStaffDto.endDate ? new Date(updateStaffDto.endDate) : undefined;
    }
    if (updateStaffDto.phoneWork !== undefined) {
      profile.phoneWork = updateStaffDto.phoneWork;
    }
    if (updateStaffDto.phoneMobile !== undefined) {
      profile.phoneMobile = updateStaffDto.phoneMobile;
    }
    if (updateStaffDto.address !== undefined) {
      profile.address = updateStaffDto.address;
    }

    // Mark profile as modified for Mongoose to detect changes
    user.markModified('profile');

    // Update user email if provided
    if (updateStaffDto.email) {
      user.email = updateStaffDto.email;
    }

    // Update user display name if name fields changed
    const needsNameUpdate =
      updateStaffDto.firstName !== undefined ||
      updateStaffDto.lastName !== undefined ||
      updateStaffDto.preferredName !== undefined;

    if (needsNameUpdate) {
      const displayName = this.buildDisplayName(updateStaffDto, existingProfile);
      if (displayName) {
        user.name = displayName;
      }
    }

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
      // Handle backward compatibility: if a single object is sent, convert to array
      const dbsArray = Array.isArray(updateStaffDto.dbs) ? updateStaffDto.dbs : [updateStaffDto.dbs];
      
      const mappedDBSArray: DBS[] = [];
      for (const dbsDto of dbsArray) {
        // If updating existing DBS, merge with existing data
        const existingDBS = Array.isArray(user.dbs) && user.dbs.length > 0 ? user.dbs[0] : undefined;
        
      const dbsData: DBS = {
          ...(existingDBS || {}),
          ...(dbsDto.staffMember !== undefined && { staffMember: dbsDto.staffMember }),
          ...(dbsDto.checkLevel !== undefined && { checkLevel: dbsDto.checkLevel }),
          ...(dbsDto.applicationSentDate && { applicationSentDate: new Date(dbsDto.applicationSentDate) }),
          ...(dbsDto.applicationReferenceNumber !== undefined && { applicationReferenceNumber: dbsDto.applicationReferenceNumber }),
          ...(dbsDto.certificateDateReceived && { certificateDateReceived: new Date(dbsDto.certificateDateReceived) }),
          ...(dbsDto.certificateNumber !== undefined && { certificateNumber: dbsDto.certificateNumber }),
          ...(dbsDto.dbsSeenBy !== undefined && { dbsSeenBy: dbsDto.dbsSeenBy }),
          ...(dbsDto.dbsCheckedDate && { dbsCheckedDate: new Date(dbsDto.dbsCheckedDate) }),
          ...(dbsDto.updateServiceId !== undefined && { updateServiceId: dbsDto.updateServiceId }),
          ...(dbsDto.updateServiceCheckDate && { updateServiceCheckDate: new Date(dbsDto.updateServiceCheckDate) }),
      };

        if (dbsDto.rightToWork !== undefined) {
          //console.log('here2')
          const mappedRightToWork = await this.mapRightToWorkData(
              dbsDto.rightToWork,
              existingDBS?.rightToWork,
          );
          //console.log('mappedRightToWork$$$$$$', mappedRightToWork);
          if (mappedRightToWork) {
            dbsData.rightToWork = mappedRightToWork;
            //console.log('dbsData$$$$$$', dbsData.rightToWork);
          } else {
            delete dbsData.rightToWork;
          }
      }

        if (dbsDto.overseas !== undefined) {
        const mappedOverseas = await this.mapOverseasData(
            dbsDto.overseas,
            existingDBS?.overseas,
        );
        if (mappedOverseas) {
          dbsData.overseas = mappedOverseas;
        } else {
          delete dbsData.overseas;
        }
      }

        if (dbsDto.childrenBarredListCheck !== undefined) {
        const mappedChildrenBarredList = await this.mapChildrenBarredListData(
            dbsDto.childrenBarredListCheck,
            existingDBS?.childrenBarredListCheck,
        );
        if (mappedChildrenBarredList) {
          dbsData.childrenBarredListCheck = mappedChildrenBarredList;
        } else {
          delete dbsData.childrenBarredListCheck;
        }
      }

        if (dbsDto.prohibitionFromTeaching !== undefined) {
          const mappedProhibitionTeaching = await this.mapProhibitionFromTeachingData(
            dbsDto.prohibitionFromTeaching,
            existingDBS?.prohibitionFromTeaching,
        );
        if (mappedProhibitionTeaching) {
          dbsData.prohibitionFromTeaching = mappedProhibitionTeaching;
        } else {
          delete dbsData.prohibitionFromTeaching;
        }
      }

        if (dbsDto.prohibitionFromManagement !== undefined) {
        const mappedProhibitionManagement = await this.mapProhibitionFromManagementData(
            dbsDto.prohibitionFromManagement,
            existingDBS?.prohibitionFromManagement,
        );
        if (mappedProhibitionManagement) {
          dbsData.prohibitionFromManagement = mappedProhibitionManagement;
        } else {
          delete dbsData.prohibitionFromManagement;
        }
      }

        if (dbsDto.disqualificationUnderChildrenAct !== undefined) {
        const mappedDisqualificationChildrenAct =
          await this.mapDisqualificationUnderChildrenActData(
              dbsDto.disqualificationUnderChildrenAct,
              existingDBS?.disqualificationUnderChildrenAct,
          );
        if (mappedDisqualificationChildrenAct) {
          dbsData.disqualificationUnderChildrenAct = mappedDisqualificationChildrenAct;
        } else {
          delete dbsData.disqualificationUnderChildrenAct;
        }
      }

        if (dbsDto.disqualifiedByAssociation !== undefined) {
        const mappedDisqualifiedByAssociation = await this.mapDisqualifiedByAssociationData(
            dbsDto.disqualifiedByAssociation,
            existingDBS?.disqualifiedByAssociation,
        );
        if (mappedDisqualifiedByAssociation) {
          dbsData.disqualifiedByAssociation = mappedDisqualifiedByAssociation;
        } else {
          delete dbsData.disqualifiedByAssociation;
        }
      }

        mappedDBSArray.push(dbsData);
        //console.log('mappedDBSArray$$$$$$', mappedDBSArray[0].rightToWork);
      }
      //console.log('mappedDBSArray$$$$$$', mappedDBSArray[0].rightToWork);
      user.dbs = mappedDBSArray;
      //console.log('user.dbs$$$$$$', user.dbs[0].rightToWork);
      // Mark DBS as modified for Mongoose to detect changes
      user.markModified('dbs');
    }

    // Mark other nested objects as modified if they were updated
    if (updateStaffDto.emergencyContacts !== undefined) {
      user.markModified('emergencyContacts');
    }
    if (updateStaffDto.cpdTraining !== undefined) {
      user.markModified('cpdTraining');
    }
    if (updateStaffDto.qualifications !== undefined) {
      user.markModified('qualifications');
    }
    if (updateStaffDto.hr !== undefined) {
      user.markModified('hr');
    }
    if (updateStaffDto.medicalNeeds !== undefined) {
      user.markModified('medicalNeeds');
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

