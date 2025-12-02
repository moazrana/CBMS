import React from 'react';
import './StudentView.scss';

export interface StudentViewProps {
  studentData: {
    _id?: string;
    personalInfo?: {
      legalFirstName?: string;
      middleName?: string;
      lastName?: string;
      preferredName?: string;
      adno?: string;
      upn?: string;
      sex?: 'Male' | 'Female' | 'Unknown';
      dateOfBirth?: string;
      email?: string;
      mobile?: string;
      admissionDate?: string;
      yearGroup?: string;
      ethnicity?: string;
      photo?: string;
      notesAndFiles?: Array<{
        fileName: string;
        filePath: string;
        fileType?: string;
        fileSize?: number;
        uploadedAt?: string;
        notes?: string;
      }>;
    };
    parents?: Array<{
      salutation?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      relationship?: string;
      priority?: 'Primary' | 'Secondary' | 'Emergency';
      sex?: 'Male' | 'Female' | 'Unknown';
      email?: string;
      homePhone?: string;
      mobile?: string;
      workPhone?: string;
      alternateHomeNo?: string;
      parentalResponsibility?: boolean;
      doNotContact?: boolean;
      parentLivesWithStudent?: boolean;
      estrangedParent?: boolean;
      copyInLetters?: boolean;
      address?: {
        apartment?: string;
        houseName?: string;
        houseNumber?: string;
        street?: string;
        townCity?: string;
        district?: string;
        county?: string;
        administrativeArea?: string;
        postTown?: string;
        postcode?: string;
      };
      notes?: string;
    }>;
    emergencyContacts?: Array<{
      name?: string;
      relationship?: string;
      dayPhone?: string;
      eveningPhone?: string;
      mobile?: string;
      email?: string;
      address?: {
        apartment?: string;
        houseName?: string;
        houseNumber?: string;
        street?: string;
        townCity?: string;
        district?: string;
        county?: string;
        administrativeArea?: string;
        postTown?: string;
        postcode?: string;
      };
      notes?: string;
    }>;
    medical?: {
      medicalDescription?: string;
      condition?: string;
      specialDiet?: string;
      medication?: string;
      medicationCode?: string;
      nhsNumber?: string;
      bloodGroup?: string;
      allergies?: string;
      impairments?: string;
      assistanceRequired?: boolean;
      assistanceDescription?: string;
      medicalConditionCategory?: string;
      lastMedicalCheckDate?: string;
      doctorDetails?: {
        name?: string;
        relationship?: string;
        mobile?: string;
        daytimePhone?: string;
        eveningPhone?: string;
        email?: string;
      };
      ehcp?: {
        hasEHCP?: boolean;
        document?: {
          fileName: string;
          filePath: string;
          fileType?: string;
          fileSize?: number;
          uploadedAt?: string;
          notes?: string;
        };
      };
      senNotes?: string;
    };
    behaviour?: {
      safeguardingConcern?: boolean;
      behaviourRiskLevel?: string;
      bodyMapPermission?: boolean;
      supportPlanDocument?: {
        fileName: string;
        filePath: string;
        fileType?: string;
        fileSize?: number;
        uploadedAt?: string;
        notes?: string;
      };
      pastBehaviourNotes?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  };
}

const StudentView: React.FC<StudentViewProps> = ({ studentData }) => {
  const personalInfo = studentData.personalInfo || {};
  const displayName = personalInfo.preferredName || 
    `${personalInfo.legalFirstName || ''} ${personalInfo.lastName || ''}`.trim() || 
    'N/A';

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatBoolean = (value?: boolean) => {
    if (value === undefined || value === null) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  const calculateAge = (dateOfBirth?: string | Date) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
      if (isNaN(birthDate.getTime())) return 'N/A';
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="staff-view">
      {/* Personal Information */}
      <div className="view-section">
        <h3>Personal Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>Legal First Name</label>
            <div className="view-value">{personalInfo.legalFirstName || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Middle Name</label>
            <div className="view-value">{personalInfo.middleName || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Last Name</label>
            <div className="view-value">{personalInfo.lastName || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Preferred Name</label>
            <div className="view-value">{personalInfo.preferredName || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Display Name</label>
            <div className="view-value">{displayName}</div>
          </div>
          <div className="view-field">
            <label>ADNO</label>
            <div className="view-value">{personalInfo.adno || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>UPN</label>
            <div className="view-value">{personalInfo.upn || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Sex</label>
            <div className="view-value">{personalInfo.sex || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Date of Birth</label>
            <div className="view-value">{formatDate(personalInfo.dateOfBirth)}</div>
          </div>
          <div className="view-field">
            <label>Age</label>
            <div className="view-value">{calculateAge(personalInfo.dateOfBirth)}</div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="view-section">
        <h3>Contact Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>Email</label>
            <div className="view-value">{personalInfo.email || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Mobile</label>
            <div className="view-value">{personalInfo.mobile || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Admission Information */}
      <div className="view-section">
        <h3>Admission Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>Admission Date</label>
            <div className="view-value">{formatDate(personalInfo.admissionDate)}</div>
          </div>
          <div className="view-field">
            <label>Year Group</label>
            <div className="view-value">{personalInfo.yearGroup || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Ethnicity</label>
            <div className="view-value">{personalInfo.ethnicity || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Photo</label>
            <div className="view-value">
              {personalInfo.photo ? (
                <a href={personalInfo.photo} target="_blank" rel="noopener noreferrer">
                  View Photo
                </a>
              ) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Parents */}
      {studentData.parents && studentData.parents.length > 0 && (
        <div className="view-section">
          <h3>Parents/Guardians ({studentData.parents.length})</h3>
          {studentData.parents.map((parent, index) => (
            <div key={index} className="view-subsection">
              <h4>Parent {index + 1}</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>Salutation</label>
                  <div className="view-value">{parent.salutation || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>First Name</label>
                  <div className="view-value">{parent.firstName || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Middle Name</label>
                  <div className="view-value">{parent.middleName || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Last Name</label>
                  <div className="view-value">{parent.lastName || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Relationship</label>
                  <div className="view-value">{parent.relationship || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Priority</label>
                  <div className="view-value">{parent.priority || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Email</label>
                  <div className="view-value">{parent.email || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Mobile</label>
                  <div className="view-value">{parent.mobile || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Home Phone</label>
                  <div className="view-value">{parent.homePhone || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Work Phone</label>
                  <div className="view-value">{parent.workPhone || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Parental Responsibility</label>
                  <div className="view-value">{formatBoolean(parent.parentalResponsibility)}</div>
                </div>
                <div className="view-field">
                  <label>Do Not Contact</label>
                  <div className="view-value">{formatBoolean(parent.doNotContact)}</div>
                </div>
              </div>
              {parent.address && (
                <div className="view-row">
                  <div className="view-field">
                    <label>Address</label>
                    <div className="view-value">
                      {[
                        parent.address.houseNumber,
                        parent.address.houseName,
                        parent.address.street,
                        parent.address.townCity,
                        parent.address.postcode
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Emergency Contacts */}
      {studentData.emergencyContacts && studentData.emergencyContacts.length > 0 && (
        <div className="view-section">
          <h3>Emergency Contacts ({studentData.emergencyContacts.length})</h3>
          {studentData.emergencyContacts.map((contact, index) => (
            <div key={index} className="view-subsection">
              <h4>Contact {index + 1}</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>Name</label>
                  <div className="view-value">{contact.name || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Relationship</label>
                  <div className="view-value">{contact.relationship || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Day Phone</label>
                  <div className="view-value">{contact.dayPhone || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Evening Phone</label>
                  <div className="view-value">{contact.eveningPhone || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Mobile</label>
                  <div className="view-value">{contact.mobile || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Email</label>
                  <div className="view-value">{contact.email || 'N/A'}</div>
                </div>
              </div>
              {contact.address && (
                <div className="view-row">
                  <div className="view-field">
                    <label>Address</label>
                    <div className="view-value">
                      {[
                        contact.address.houseNumber,
                        contact.address.houseName,
                        contact.address.street,
                        contact.address.townCity,
                        contact.address.postcode
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
              {contact.notes && (
                <div className="view-row">
                  <div className="view-field">
                    <label>Notes</label>
                    <div className="view-value">{contact.notes}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Medical Information */}
      {studentData.medical && (
        <div className="view-section">
          <h3>Medical Information</h3>
          <div className="view-row">
            <div className="view-field">
              <label>Medical Description</label>
              <div className="view-value">{studentData.medical.medicalDescription || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Condition</label>
              <div className="view-value">{studentData.medical.condition || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>Special Diet</label>
              <div className="view-value">{studentData.medical.specialDiet || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Medication</label>
              <div className="view-value">{studentData.medical.medication || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>NHS Number</label>
              <div className="view-value">{studentData.medical.nhsNumber || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Blood Group</label>
              <div className="view-value">{studentData.medical.bloodGroup || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>Allergies</label>
              <div className="view-value">{studentData.medical.allergies || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Impairments</label>
              <div className="view-value">{studentData.medical.impairments || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>Assistance Required</label>
              <div className="view-value">{formatBoolean(studentData.medical.assistanceRequired)}</div>
            </div>
            <div className="view-field">
              <label>Last Medical Check Date</label>
              <div className="view-value">{formatDate(studentData.medical.lastMedicalCheckDate)}</div>
            </div>
          </div>
          {studentData.medical.doctorDetails && (
            <div className="view-subsection">
              <h4>Doctor Details</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>Name</label>
                  <div className="view-value">{studentData.medical.doctorDetails.name || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Relationship</label>
                  <div className="view-value">{studentData.medical.doctorDetails.relationship || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Mobile</label>
                  <div className="view-value">{studentData.medical.doctorDetails.mobile || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Daytime Phone</label>
                  <div className="view-value">{studentData.medical.doctorDetails.daytimePhone || 'N/A'}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Evening Phone</label>
                  <div className="view-value">{studentData.medical.doctorDetails.eveningPhone || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Email</label>
                  <div className="view-value">{studentData.medical.doctorDetails.email || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
          {studentData.medical.ehcp && (
            <div className="view-subsection">
              <h4>EHCP</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>Has EHCP</label>
                  <div className="view-value">{formatBoolean(studentData.medical.ehcp.hasEHCP)}</div>
                </div>
                {studentData.medical.ehcp.document && (
                  <div className="view-field">
                    <label>Document</label>
                    <div className="view-value">
                      <a href={studentData.medical.ehcp.document.filePath} target="_blank" rel="noopener noreferrer">
                        {studentData.medical.ehcp.document.fileName}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {studentData.medical.senNotes && (
            <div className="view-row">
              <div className="view-field">
                <label>SEN Notes</label>
                <div className="view-value">{studentData.medical.senNotes}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Behaviour Information */}
      {studentData.behaviour && (
        <div className="view-section">
          <h3>Behaviour Information</h3>
          <div className="view-row">
            <div className="view-field">
              <label>Safeguarding Concern</label>
              <div className="view-value">{formatBoolean(studentData.behaviour.safeguardingConcern)}</div>
            </div>
            <div className="view-field">
              <label>Behaviour Risk Level</label>
              <div className="view-value">{studentData.behaviour.behaviourRiskLevel || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>Body-Map Permission</label>
              <div className="view-value">{formatBoolean(studentData.behaviour.bodyMapPermission)}</div>
            </div>
            {studentData.behaviour.supportPlanDocument && (
              <div className="view-field">
                <label>Support Plan Document</label>
                <div className="view-value">
                  <a href={studentData.behaviour.supportPlanDocument.filePath} target="_blank" rel="noopener noreferrer">
                    {studentData.behaviour.supportPlanDocument.fileName}
                  </a>
                </div>
              </div>
            )}
          </div>
          {studentData.behaviour.pastBehaviourNotes && (
            <div className="view-row">
              <div className="view-field">
                <label>Past Behaviour Notes</label>
                <div className="view-value">{studentData.behaviour.pastBehaviourNotes}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes and Files */}
      {personalInfo.notesAndFiles && personalInfo.notesAndFiles.length > 0 && (
        <div className="view-section">
          <h3>Notes & Files ({personalInfo.notesAndFiles.length})</h3>
          {personalInfo.notesAndFiles.map((file, index) => (
            <div key={index} className="view-subsection">
              <h4>{file.fileName}</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>File Type</label>
                  <div className="view-value">{file.fileType || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Uploaded</label>
                  <div className="view-value">{formatDate(file.uploadedAt)}</div>
                </div>
              </div>
              {file.notes && (
                <div className="view-row">
                  <div className="view-field">
                    <label>Notes</label>
                    <div className="view-value">{file.notes}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timestamps */}
      <div className="view-section">
        <h3>Record Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>Created</label>
            <div className="view-value">{formatDate(studentData.createdAt)}</div>
          </div>
          <div className="view-field">
            <label>Last Updated</label>
            <div className="view-value">{formatDate(studentData.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;

