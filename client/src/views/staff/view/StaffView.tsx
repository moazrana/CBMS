import React from 'react';
import './StaffView.scss';

interface StaffViewProps {
  staffData: {
    _id?: string;
    name?: string;
    email?: string;
    profile?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      preferredName?: string;
      phoneWork?: string;
      phoneMobile?: string;
      jobRole?: string;
      department?: string;
      startDate?: string;
      endDate?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    };
    emergencyContacts?: Array<{
      name?: string;
      relationship?: string;
      daytimeTelephone?: string;
      eveningTelephone?: string;
      mobile?: string;
      email?: string;
      address?: string;
      notes?: string;
    }>;
    dbs?: any;
    cpdTraining?: Array<any>;
    safeguardingTraining?: Array<any>;
    qualifications?: Array<any>;
    hr?: Array<any>;
    medicalNeeds?: any;
    createdAt?: string;
    updatedAt?: string;
  };
}

const StaffView: React.FC<StaffViewProps> = ({ staffData }) => {
  const profile = staffData.profile || {};
  const displayName = profile.preferredName || 
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 
    staffData.name || 
    'N/A';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="staff-view">
      {/* Basic Information */}
      <div className="view-section">
        <h3>Personal Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>First Name</label>
            <div className="view-value">{profile.firstName || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Middle Name</label>
            <div className="view-value">{profile.middleName || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Last Name</label>
            <div className="view-value">{profile.lastName || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Preferred Name</label>
            <div className="view-value">{profile.preferredName || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Display Name</label>
            <div className="view-value">{displayName}</div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="view-section">
        <h3>Contact Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>Email</label>
            <div className="view-value">{staffData.email || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Work Phone</label>
            <div className="view-value">{profile.phoneWork || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Mobile Phone</label>
            <div className="view-value">{profile.phoneMobile || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="view-section">
        <h3>Employment Information</h3>
        <div className="view-row">
          <div className="view-field">
            <label>Job Role</label>
            <div className="view-value">{profile.jobRole || 'N/A'}</div>
          </div>
          <div className="view-field">
            <label>Department</label>
            <div className="view-value">{profile.department || 'N/A'}</div>
          </div>
        </div>
        <div className="view-row">
          <div className="view-field">
            <label>Start Date</label>
            <div className="view-value">{formatDate(profile.startDate)}</div>
          </div>
          <div className="view-field">
            <label>End Date</label>
            <div className="view-value">{formatDate(profile.endDate)}</div>
          </div>
        </div>
      </div>

      {/* Address */}
      {profile.address && (
        <div className="view-section">
          <h3>Address</h3>
          <div className="view-row">
            <div className="view-field">
              <label>Address Line 1</label>
              <div className="view-value">{profile.address.line1 || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Address Line 2</label>
              <div className="view-value">{profile.address.line2 || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>City</label>
              <div className="view-value">{profile.address.city || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>State</label>
              <div className="view-value">{profile.address.state || 'N/A'}</div>
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <label>Postal Code</label>
              <div className="view-value">{profile.address.postalCode || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Country</label>
              <div className="view-value">{profile.address.country || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {staffData.emergencyContacts && staffData.emergencyContacts.length > 0 && (
        <div className="view-section">
          <h3>Emergency Contacts</h3>
          {staffData.emergencyContacts.map((contact, index) => (
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
                  <label>Daytime Phone</label>
                  <div className="view-value">{contact.daytimeTelephone || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Evening Phone</label>
                  <div className="view-value">{contact.eveningTelephone || 'N/A'}</div>
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
            </div>
          ))}
        </div>
      )}

      {/* DBS Information */}
      {staffData.dbs && (
        <div className="view-section">
          <h3>DBS Information</h3>
          <div className="view-row">
            <div className="view-field">
              <label>Check Level</label>
              <div className="view-value">{staffData.dbs.checkLevel || 'N/A'}</div>
            </div>
            <div className="view-field">
              <label>Certificate Number</label>
              <div className="view-value">{staffData.dbs.certificateNumber || 'N/A'}</div>
            </div>
          </div>
          {staffData.dbs.updateServiceCheckDate && (
            <div className="view-row">
              <div className="view-field">
                <label>Update Service Check Date</label>
                <div className="view-value">{formatDate(staffData.dbs.updateServiceCheckDate)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CPD Training */}
      {staffData.cpdTraining && staffData.cpdTraining.length > 0 && (
        <div className="view-section">
          <h3>CPD Training ({staffData.cpdTraining.length})</h3>
          {staffData.cpdTraining.map((training, index) => (
            <div key={index} className="view-subsection">
              <h4>{training.courseName || `Training ${index + 1}`}</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>Status</label>
                  <div className="view-value">{training.status || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Date Completed</label>
                  <div className="view-value">{formatDate(training.dateCompleted)}</div>
                </div>
              </div>
              <div className="view-row">
                <div className="view-field">
                  <label>Expiry Date</label>
                  <div className="view-value">{formatDate(training.expiryDate)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Qualifications */}
      {staffData.qualifications && staffData.qualifications.length > 0 && (
        <div className="view-section">
          <h3>Qualifications ({staffData.qualifications.length})</h3>
          {staffData.qualifications.map((qual, index) => (
            <div key={index} className="view-subsection">
              <h4>{qual.qualificationName || `Qualification ${index + 1}`}</h4>
              <div className="view-row">
                <div className="view-field">
                  <label>Type</label>
                  <div className="view-value">{qual.qualificationType || 'N/A'}</div>
                </div>
                <div className="view-field">
                  <label>Achieved Date</label>
                  <div className="view-value">{formatDate(qual.achievedDate)}</div>
                </div>
              </div>
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
            <div className="view-value">{formatDate(staffData.createdAt)}</div>
          </div>
          <div className="view-field">
            <label>Last Updated</label>
            <div className="view-value">{formatDate(staffData.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffView;

