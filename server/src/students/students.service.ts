import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument, PersonalInfo, Parent, EmergencyContact, Medical, Behaviour } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  /**
   * Generate auto-incrementing ADNO (Admission Number)
   * Format: ADNO-YYYY-XXXX (e.g., ADNO-2024-0001)
   */
  private async generateADNO(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `ADNO-${currentYear}-`;

    // Find the highest ADNO for current year
    const lastStudent = await this.studentModel
      .findOne({
        'personalInfo.adno': { $regex: `^${prefix}` },
      })
      .sort({ 'personalInfo.adno': -1 })
      .lean();

    let sequence = 1;
    if (lastStudent?.personalInfo?.adno) {
      const lastSequence = parseInt(
        lastStudent.personalInfo.adno.replace(prefix, ''),
        10,
      );
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Validate UPN (Unique Pupil Number) format
   * UPN format: 13 characters (alphanumeric)
   */
  private validateUPN(upn: string): boolean {
    // UPN should be 13 characters, alphanumeric
    const upnRegex = /^[A-Z0-9]{13}$/;
    return upnRegex.test(upn.toUpperCase());
  }

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const dtoPersonalInfo = createStudentDto.personalInfo;
    
    // Build personalInfo with proper type conversions
    const personalInfo: PersonalInfo = {
      legalFirstName: dtoPersonalInfo.legalFirstName,
      lastName: dtoPersonalInfo.lastName,
      middleName: dtoPersonalInfo.middleName,
      preferredName: dtoPersonalInfo.preferredName,
      adno: dtoPersonalInfo.adno,
      upn: dtoPersonalInfo.upn,
      sex: dtoPersonalInfo.sex,
      dateOfBirth: dtoPersonalInfo.dateOfBirth ? new Date(dtoPersonalInfo.dateOfBirth) : undefined,
      email: dtoPersonalInfo.email,
      mobile: dtoPersonalInfo.mobile,
      admissionDate: dtoPersonalInfo.admissionDate ? new Date(dtoPersonalInfo.admissionDate) : undefined,
      yearGroup: dtoPersonalInfo.yearGroup,
      ethnicity: dtoPersonalInfo.ethnicity,
      photo: dtoPersonalInfo.photo,
      location: dtoPersonalInfo.location,
      notesAndFiles: dtoPersonalInfo.notesAndFiles?.map((file) => ({
        fileName: file.fileName,
        filePath: file.filePath,
        fileType: file.fileType,
        fileSize: file.fileSize,
        uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
        notes: file.notes,
      })),
    };

    // Auto-generate ADNO if not provided
    if (!personalInfo.adno) {
      personalInfo.adno = await this.generateADNO();
    } else {
      // Check if ADNO already exists
      const existingADNO = await this.studentModel.findOne({
        'personalInfo.adno': personalInfo.adno,
        deletedAt: null,
      });
      if (existingADNO) {
        throw new ConflictException(`ADNO ${personalInfo.adno} already exists`);
      }
    }

    // Handle UPN if provided (no validation, just check uniqueness)
    if (personalInfo.upn) {
      // Check if UPN already exists
      const existingUPN = await this.studentModel.findOne({
        'personalInfo.upn': personalInfo.upn,
        deletedAt: null,
      });
      if (existingUPN) {
        throw new ConflictException(`UPN ${personalInfo.upn} already exists`);
      }
    }

    // Build medical object with proper type conversions
    let medical: Medical | undefined;
    if (createStudentDto.medical) {
      const dtoMedical = createStudentDto.medical;
      medical = {
        medicalDescription: dtoMedical.medicalDescription,
        condition: dtoMedical.condition,
        specialDiet: dtoMedical.specialDiet,
        medication: dtoMedical.medication,
        medicationCode: dtoMedical.medicationCode,
        nhsNumber: dtoMedical.nhsNumber,
        bloodGroup: dtoMedical.bloodGroup,
        allergies: dtoMedical.allergies,
        impairments: dtoMedical.impairments,
        assistanceRequired: dtoMedical.assistanceRequired,
        assistanceDescription: dtoMedical.assistanceDescription,
        medicalConditionCategory: dtoMedical.medicalConditionCategory,
        lastMedicalCheckDate: dtoMedical.lastMedicalCheckDate
          ? new Date(dtoMedical.lastMedicalCheckDate)
          : undefined,
        doctorDetails: dtoMedical.doctorDetails,
        ehcp: dtoMedical.ehcp
          ? {
              hasEHCP: dtoMedical.ehcp.hasEHCP,
              document: dtoMedical.ehcp.document
                ? {
                    fileName: dtoMedical.ehcp.document.fileName,
                    filePath: dtoMedical.ehcp.document.filePath,
                    fileType: dtoMedical.ehcp.document.fileType,
                    fileSize: dtoMedical.ehcp.document.fileSize,
                    uploadedAt: dtoMedical.ehcp.document.uploadedAt
                      ? new Date(dtoMedical.ehcp.document.uploadedAt)
                      : new Date(),
                    notes: dtoMedical.ehcp.document.notes,
                  }
                : undefined,
            }
          : undefined,
        senNotes: dtoMedical.senNotes,
      };
    }

    // Build behaviour object with proper type conversions
    let behaviour: Behaviour | undefined;
    if (createStudentDto.behaviour) {
      const dtoBehaviour = createStudentDto.behaviour;
      behaviour = {
        safeguardingConcern: dtoBehaviour.safeguardingConcern,
        behaviourRiskLevel: dtoBehaviour.behaviourRiskLevel,
        bodyMapPermission: dtoBehaviour.bodyMapPermission,
        supportPlanDocument: dtoBehaviour.supportPlanDocument
          ? {
              fileName: dtoBehaviour.supportPlanDocument.fileName,
              filePath: dtoBehaviour.supportPlanDocument.filePath,
              fileType: dtoBehaviour.supportPlanDocument.fileType,
              fileSize: dtoBehaviour.supportPlanDocument.fileSize,
              uploadedAt: dtoBehaviour.supportPlanDocument.uploadedAt
                ? new Date(dtoBehaviour.supportPlanDocument.uploadedAt)
                : new Date(),
              notes: dtoBehaviour.supportPlanDocument.notes,
            }
          : undefined,
        pastBehaviourNotes: dtoBehaviour.pastBehaviourNotes,
      };
    }

    const student = new this.studentModel({
      personalInfo,
      parents: createStudentDto.parents || [],
      emergencyContacts: createStudentDto.emergencyContacts || [],
      medical,
      behaviour,
    });

    try {
      return await student.save();
    } catch (error) {
      if (error?.code === 11000) {
        // MongoDB duplicate key error
        const field = Object.keys(error.keyPattern || {})[0];
        if (field === 'personalInfo.adno') {
          throw new ConflictException('ADNO already exists');
        }
        if (field === 'personalInfo.upn') {
          throw new ConflictException('UPN already exists');
        }
        throw new ConflictException('Duplicate entry detected');
      }
      throw new BadRequestException(
        error.message || 'Failed to create student',
      );
    }
  }

  async findAll(sort: string = 'createdAt', order: string = 'DESC', search: string = '', page: number = 1, perPage: number = 10): Promise<StudentDocument[]> {
    const sortOrder = order === 'DESC' ? -1 : 1;
    const query = this.studentModel.find({ deletedAt: null });
    
    if (search) {
      query.where({
        $or: [
          { 'personalInfo.legalFirstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { 'personalInfo.preferredName': { $regex: search, $options: 'i' } },
          { 'personalInfo.adno': { $regex: search, $options: 'i' } },
          { 'personalInfo.upn': { $regex: search, $options: 'i' } },
        ],
      });
    }
    
    // Handle nested field sorting
    let sortField: any = { [sort]: sortOrder };
    if (sort === 'createdAt' || sort === 'updatedAt') {
      sortField = { [sort]: sortOrder };
    } else if (sort.startsWith('personalInfo.')) {
      sortField = { [sort]: sortOrder };
    }
    
    return query
      .sort(sortField)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
  }

  async findOne(id: string): Promise<StudentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student identifier');
    }

    const student = await this.studentModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student as StudentDocument;
  }

  async findByADNO(adno: string): Promise<StudentDocument | null> {
    return this.studentModel
      .findOne({ 'personalInfo.adno': adno, deletedAt: null })
      .lean();
  }

  async findByUPN(upn: string): Promise<StudentDocument | null> {
    return this.studentModel
      .findOne({ 'personalInfo.upn': upn.toUpperCase(), deletedAt: null })
      .lean();
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student identifier');
    }

    const student = await this.studentModel.findById(id);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.deletedAt) {
      throw new NotFoundException('Student not found');
    }

    // Update personalInfo fields
    if (updateStudentDto.personalInfo) {
      const updateData = updateStudentDto.personalInfo;
      const personalInfo = student.personalInfo as PersonalInfo;

      // Update individual fields
      if (updateData.legalFirstName !== undefined) {
        personalInfo.legalFirstName = updateData.legalFirstName;
      }
      if (updateData.middleName !== undefined) {
        personalInfo.middleName = updateData.middleName;
      }
      if (updateData.lastName !== undefined) {
        personalInfo.lastName = updateData.lastName;
      }
      if (updateData.preferredName !== undefined) {
        personalInfo.preferredName = updateData.preferredName;
      }

      // Handle ADNO update
      if (updateData.adno !== undefined && updateData.adno !== personalInfo.adno) {
        // Check if new ADNO already exists
        const existingADNO = await this.studentModel.findOne({
          'personalInfo.adno': updateData.adno,
          _id: { $ne: id },
          deletedAt: null,
        });
        if (existingADNO) {
          throw new ConflictException(`ADNO ${updateData.adno} already exists`);
        }
        personalInfo.adno = updateData.adno;
      }

      // Handle UPN update (no validation, just check uniqueness)
      if (updateData.upn !== undefined && updateData.upn !== personalInfo.upn) {
        // Check if new UPN already exists
        const existingUPN = await this.studentModel.findOne({
          'personalInfo.upn': updateData.upn,
          _id: { $ne: id },
          deletedAt: null,
        });
        if (existingUPN) {
          throw new ConflictException(`UPN ${updateData.upn} already exists`);
        }
        personalInfo.upn = updateData.upn;
      }

      if (updateData.sex !== undefined) {
        personalInfo.sex = updateData.sex;
      }
      if (updateData.dateOfBirth !== undefined) {
        personalInfo.dateOfBirth = updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined;
      }
      if (updateData.email !== undefined) {
        personalInfo.email = updateData.email;
      }
      if (updateData.mobile !== undefined) {
        personalInfo.mobile = updateData.mobile;
      }
      if (updateData.admissionDate !== undefined) {
        personalInfo.admissionDate = updateData.admissionDate
          ? new Date(updateData.admissionDate)
          : undefined;
      }
      if (updateData.yearGroup !== undefined) {
        personalInfo.yearGroup = updateData.yearGroup;
      }
      if (updateData.ethnicity !== undefined) {
        personalInfo.ethnicity = updateData.ethnicity;
      }
      if (updateData.photo !== undefined) {
        personalInfo.photo = updateData.photo;
      }
      if (updateData.location !== undefined) {
        personalInfo.location = updateData.location;
      }
      if (updateData.notesAndFiles !== undefined) {
        personalInfo.notesAndFiles = updateData.notesAndFiles.map((file) => ({
          ...file,
          uploadedAt: file.uploadedAt
            ? new Date(file.uploadedAt)
            : new Date(),
        }));
      }

      // Mark personalInfo as modified
      student.markModified('personalInfo');
    }

    // Update parents array
    if (updateStudentDto.parents !== undefined) {
      student.parents = updateStudentDto.parents as Parent[];
      student.markModified('parents');
    }

    // Update emergency contacts array
    if (updateStudentDto.emergencyContacts !== undefined) {
      student.emergencyContacts = updateStudentDto.emergencyContacts as EmergencyContact[];
      student.markModified('emergencyContacts');
    }

    // Update medical information
    if (updateStudentDto.medical !== undefined) {
      const updateMedical = updateStudentDto.medical;
      const medical = student.medical as Medical;

      if (!medical) {
        // Create new medical object
        student.medical = {
          medicalDescription: updateMedical.medicalDescription,
          condition: updateMedical.condition,
          specialDiet: updateMedical.specialDiet,
          medication: updateMedical.medication,
          medicationCode: updateMedical.medicationCode,
          nhsNumber: updateMedical.nhsNumber,
          bloodGroup: updateMedical.bloodGroup,
          allergies: updateMedical.allergies,
          impairments: updateMedical.impairments,
          assistanceRequired: updateMedical.assistanceRequired,
          assistanceDescription: updateMedical.assistanceDescription,
          medicalConditionCategory: updateMedical.medicalConditionCategory,
          lastMedicalCheckDate: updateMedical.lastMedicalCheckDate
            ? new Date(updateMedical.lastMedicalCheckDate)
            : undefined,
          doctorDetails: updateMedical.doctorDetails,
          ehcp: updateMedical.ehcp
            ? {
                hasEHCP: updateMedical.ehcp.hasEHCP,
                document: updateMedical.ehcp.document
                  ? {
                      fileName: updateMedical.ehcp.document.fileName,
                      filePath: updateMedical.ehcp.document.filePath,
                      fileType: updateMedical.ehcp.document.fileType,
                      fileSize: updateMedical.ehcp.document.fileSize,
                      uploadedAt: updateMedical.ehcp.document.uploadedAt
                        ? new Date(updateMedical.ehcp.document.uploadedAt)
                        : new Date(),
                      notes: updateMedical.ehcp.document.notes,
                    }
                  : undefined,
              }
            : undefined,
          senNotes: updateMedical.senNotes,
        };
      } else {
        // Update existing medical object
        if (updateMedical.medicalDescription !== undefined) {
          medical.medicalDescription = updateMedical.medicalDescription;
        }
        if (updateMedical.condition !== undefined) {
          medical.condition = updateMedical.condition;
        }
        if (updateMedical.specialDiet !== undefined) {
          medical.specialDiet = updateMedical.specialDiet;
        }
        if (updateMedical.medication !== undefined) {
          medical.medication = updateMedical.medication;
        }
        if (updateMedical.medicationCode !== undefined) {
          medical.medicationCode = updateMedical.medicationCode;
        }
        if (updateMedical.nhsNumber !== undefined) {
          medical.nhsNumber = updateMedical.nhsNumber;
        }
        if (updateMedical.bloodGroup !== undefined) {
          medical.bloodGroup = updateMedical.bloodGroup;
        }
        if (updateMedical.allergies !== undefined) {
          medical.allergies = updateMedical.allergies;
        }
        if (updateMedical.impairments !== undefined) {
          medical.impairments = updateMedical.impairments;
        }
        if (updateMedical.assistanceRequired !== undefined) {
          medical.assistanceRequired = updateMedical.assistanceRequired;
        }
        if (updateMedical.assistanceDescription !== undefined) {
          medical.assistanceDescription = updateMedical.assistanceDescription;
        }
        if (updateMedical.medicalConditionCategory !== undefined) {
          medical.medicalConditionCategory = updateMedical.medicalConditionCategory;
        }
        if (updateMedical.lastMedicalCheckDate !== undefined) {
          medical.lastMedicalCheckDate = updateMedical.lastMedicalCheckDate
            ? new Date(updateMedical.lastMedicalCheckDate)
            : undefined;
        }
        if (updateMedical.doctorDetails !== undefined) {
          medical.doctorDetails = updateMedical.doctorDetails;
        }
        if (updateMedical.ehcp !== undefined) {
          medical.ehcp = {
            hasEHCP: updateMedical.ehcp.hasEHCP,
            document: updateMedical.ehcp.document
              ? {
                  fileName: updateMedical.ehcp.document.fileName,
                  filePath: updateMedical.ehcp.document.filePath,
                  fileType: updateMedical.ehcp.document.fileType,
                  fileSize: updateMedical.ehcp.document.fileSize,
                  uploadedAt: updateMedical.ehcp.document.uploadedAt
                    ? new Date(updateMedical.ehcp.document.uploadedAt)
                    : new Date(),
                  notes: updateMedical.ehcp.document.notes,
                }
              : undefined,
          };
        }
        if (updateMedical.senNotes !== undefined) {
          medical.senNotes = updateMedical.senNotes;
        }
      }

      // Mark medical as modified
      student.markModified('medical');
    }

    // Update behaviour information
    if (updateStudentDto.behaviour !== undefined) {
      const updateBehaviour = updateStudentDto.behaviour;
      const behaviour = student.behaviour as Behaviour;

      if (!behaviour) {
        // Create new behaviour object
        student.behaviour = {
          safeguardingConcern: updateBehaviour.safeguardingConcern,
          behaviourRiskLevel: updateBehaviour.behaviourRiskLevel,
          bodyMapPermission: updateBehaviour.bodyMapPermission,
          supportPlanDocument: updateBehaviour.supportPlanDocument
            ? {
                fileName: updateBehaviour.supportPlanDocument.fileName,
                filePath: updateBehaviour.supportPlanDocument.filePath,
                fileType: updateBehaviour.supportPlanDocument.fileType,
                fileSize: updateBehaviour.supportPlanDocument.fileSize,
                uploadedAt: updateBehaviour.supportPlanDocument.uploadedAt
                  ? new Date(updateBehaviour.supportPlanDocument.uploadedAt)
                  : new Date(),
                notes: updateBehaviour.supportPlanDocument.notes,
              }
            : undefined,
          pastBehaviourNotes: updateBehaviour.pastBehaviourNotes,
        };
      } else {
        // Update existing behaviour object
        if (updateBehaviour.safeguardingConcern !== undefined) {
          behaviour.safeguardingConcern = updateBehaviour.safeguardingConcern;
        }
        if (updateBehaviour.behaviourRiskLevel !== undefined) {
          behaviour.behaviourRiskLevel = updateBehaviour.behaviourRiskLevel;
        }
        if (updateBehaviour.bodyMapPermission !== undefined) {
          behaviour.bodyMapPermission = updateBehaviour.bodyMapPermission;
        }
        if (updateBehaviour.supportPlanDocument !== undefined) {
          behaviour.supportPlanDocument = updateBehaviour.supportPlanDocument
            ? {
                fileName: updateBehaviour.supportPlanDocument.fileName,
                filePath: updateBehaviour.supportPlanDocument.filePath,
                fileType: updateBehaviour.supportPlanDocument.fileType,
                fileSize: updateBehaviour.supportPlanDocument.fileSize,
                uploadedAt: updateBehaviour.supportPlanDocument.uploadedAt
                  ? new Date(updateBehaviour.supportPlanDocument.uploadedAt)
                  : new Date(),
                notes: updateBehaviour.supportPlanDocument.notes,
              }
            : undefined;
        }
        if (updateBehaviour.pastBehaviourNotes !== undefined) {
          behaviour.pastBehaviourNotes = updateBehaviour.pastBehaviourNotes;
        }
      }

      // Mark behaviour as modified
      student.markModified('behaviour');
    }

    try {
      await student.save();
      return this.findOne(id);
    } catch (error) {
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        if (field === 'personalInfo.adno') {
          throw new ConflictException('ADNO already exists');
        }
        if (field === 'personalInfo.upn') {
          throw new ConflictException('UPN already exists');
        }
        throw new ConflictException('Duplicate entry detected');
      }
      throw new BadRequestException(
        error.message || 'Failed to update student',
      );
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student identifier');
    }

    const student = await this.studentModel.findById(id);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Soft delete
    student.deletedAt = new Date();
    await student.save();

    return { success: true };
  }

  async hardDelete(id: string): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student identifier');
    }

    const result = await this.studentModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Student not found');
    }

    return { success: true };
  }
}

