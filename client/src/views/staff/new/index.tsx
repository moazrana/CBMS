import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../../layouts/layout';
import Input from '../../../components/input/Input';
import TextField from '../../../components/textField/TextField';
import Select from '../../../components/Select/Select';
import Popup from '../../../components/Popup/Popup';
import { Tabs } from '../../../components/Tabs/Tabs';
import { useApiRequest } from '../../../hooks/useApiRequest';
import './index.scss';

interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface EmergencyContact {
  name?: string;
  relationship?: string;
  daytimeTelephone?: string;
  eveningTelephone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface DBS {
  staffMember?: string;
  checkLevel?: string;
  applicationSentDate?: string;
  applicationReferenceNumber?: string;
  certificateDateReceived?: string;
  certificateNumber?: string;
  dbsSeenBy?: string;
  dbsCheckedDate?: string;
  updateServiceId?: string;
  updateServiceCheckDate?: string;
  rightToWork?: {
    type?: string;
    verifiedDate?: string;
    verifiedByUserId?: string;
    expiry?: string;
    evidence?: string;
  };
  overseas?: {
    checkNeeded?: boolean;
    evidenceProduced?: boolean;
    checkDate?: string;
    checkedByUserId?: string;
    uploadEvidence?: string;
  };
  childrenBarredListCheck?: {
    completed?: boolean;
    checkDate?: string;
    checkedByUserId?: string;
  };
  prohibitionFromTeaching?: {
    checked?: boolean;
    checkDate?: string;
    checkedByUserId?: string;
  };
  prohibitionFromManagement?: {
    completed?: boolean;
    checkDate?: string;
    checkedByUserId?: string;
    notes?: string;
  };
  disqualificationUnderChildrenAct?: {
    completed?: boolean;
    checkDate?: string;
    checkedByUserId?: string;
  };
  disqualifiedByAssociation?: {
    completed?: boolean;
    checkedDate?: string;
    checkedByUserId?: string;
  };
}

interface TrainingRecord {
  courseName: string;
  dateCompleted?: string;
  expiryDate?: string;
  status?: string;
  notes?: string;
  uploadCertificate?: string;
}

interface Qualification {
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
}

interface HRRecord {
  absenceType?: string;
  absenceDate?: string;
  reason?: string;
  evidenceUpload?: string;
}

interface DoctorContact {
  name?: string;
  relationship?: string;
  mobile?: string;
  daytimePhone?: string;
  eveningPhone?: string;
  email?: string;
}

interface MedicalNeeds {
  medicalDescription?: string;
  conditionsSyndrome?: string;
  medication?: string;
  specialDiet?: string;
  impairments?: string;
  allergies?: string;
  assistanceRequired?: string;
  nhsNumber?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  lastMedicalCheck?: string;
  doctorContactDetails?: DoctorContact[];
}

interface StaffData {
  firstName: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  email: string;
  phoneWork?: string;
  phoneMobile?: string;
  jobRole?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  address?: Address;
  emergencyContacts?: EmergencyContact[];
  dbs?: DBS;
  cpdTraining?: TrainingRecord[];
  qualifications?: Qualification[];
  hr?: HRRecord[];
  medicalNeeds?: MedicalNeeds;
}

const NewStaff = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { executeRequest, loading } = useApiRequest();
  const [activeTab, setActiveTab] = useState('basic');
  
  // Ref to track focused input
  const focusedInputRef = useRef<{ name: string; selectionStart: number | null } | null>(null);
  
  // Save focus state before render
  const saveFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    focusedInputRef.current = {
      name: input.name,
      selectionStart: input.selectionStart,
    };
  }, []);
  
  // Restore focus after render
  useEffect(() => {
    if (focusedInputRef.current) {
      const input = document.querySelector(`input[name="${focusedInputRef.current.name}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        if (focusedInputRef.current.selectionStart !== null) {
          input.setSelectionRange(focusedInputRef.current.selectionStart, focusedInputRef.current.selectionStart);
        }
      }
    }
  });
  
  // Create stable onChange handlers for each field
  const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, firstName: e.target.value }));
  }, []);
  
  const handleMiddleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, middleName: e.target.value }));
  }, []);
  
  const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, lastName: e.target.value }));
  }, []);
  
  const handlePreferredNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, preferredName: e.target.value }));
  }, []);
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, email: e.target.value }));
  }, []);
  
  const handlePhoneWorkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, phoneWork: e.target.value }));
  }, []);
  
  const handlePhoneMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, phoneMobile: e.target.value }));
  }, []);
  
  const handleJobRoleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, jobRole: e.target.value }));
  }, []);
  
  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, department: e.target.value }));
  }, []);
  
  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, startDate: e.target.value }));
  }, []);
  
  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, endDate: e.target.value }));
  }, []);

  const [staffData, setStaffData] = useState<StaffData>({
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    email: '',
    phoneWork: '',
    phoneMobile: '',
    jobRole: '',
    department: '',
    startDate: '',
    endDate: '',
    address: {},
    emergencyContacts: [],
    dbs: {},
    cpdTraining: [],
    qualifications: [],
    hr: [],
    medicalNeeds: {},
  });

  // Fetch staff data if editing
  const fetchStaff = async () => {
    if (!id) return;
    
    try {
      const response = await executeRequest('get', `/staff/${id}`);
      setStaffData({
        firstName: response.firstName || '',
        middleName: response.middleName || '',
        lastName: response.lastName || '',
        preferredName: response.preferredName || '',
        email: response.email || '',
        phoneWork: response.phoneWork || '',
        phoneMobile: response.phoneMobile || '',
        jobRole: response.jobRole || '',
        department: response.department || '',
        startDate: response.startDate ? response.startDate.split('T')[0] : '',
        endDate: response.endDate ? response.endDate.split('T')[0] : '',
        address: response.address || {},
        emergencyContacts: response.emergencyContacts || [],
        dbs: response.dbs ? {
          ...response.dbs,
          rightToWork: response.dbs.rightToWork || {},
          overseas: response.dbs.overseas || {},
          childrenBarredListCheck: response.dbs.childrenBarredListCheck || {},
          prohibitionFromTeaching: response.dbs.prohibitionFromTeaching || {},
          prohibitionFromManagement: response.dbs.prohibitionFromManagement || {},
          disqualificationUnderChildrenAct: response.dbs.disqualificationUnderChildrenAct || {},
          disqualifiedByAssociation: response.dbs.disqualifiedByAssociation || {},
        } : {},
        cpdTraining: response.cpdTraining || [],
        qualifications: response.qualifications || [],
        hr: response.hr || [],
        medicalNeeds: response.medicalNeeds || {},
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Failed to load staff data');
    }
  };

  useEffect(() => {
    if (id) {
      fetchStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Helper function to clean empty date strings recursively
  const cleanEmptyDateStrings = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => cleanEmptyDateStrings(item));
    }

    if (typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = (obj as Record<string, unknown>)[key];
          // Check if the key suggests it's a date field and the value is an empty string
          if (
            (key.toLowerCase().includes('date') || 
             key.toLowerCase().includes('expiry') ||
             key.toLowerCase().includes('completed')) &&
            typeof value === 'string' &&
            value.trim() === ''
          ) {
            cleaned[key] = undefined;
          } else {
            cleaned[key] = cleanEmptyDateStrings(value);
          }
        }
      }
      return cleaned;
    }

    return obj;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!staffData.firstName || !staffData.email) {
      alert('Please fill in all required fields (First Name and Email)');
      return;
    }

    // Clean data: convert empty date strings to undefined recursively
    const cleanedData = cleanEmptyDateStrings(staffData);

    try {
      if (id) {
        // Update existing staff
        await executeRequest('patch', `/staff/${id}`, cleanedData);
        alert('Staff member updated successfully!');
      } else {
        // Create new staff
        await executeRequest('post', '/staff', cleanedData);
        alert('Staff member created successfully!');
      }
      
      navigate('/staff');
    } catch (error: unknown) {
      console.error('Error saving staff:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        : undefined;
      alert(errorMessage || 'Failed to save staff member. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/staff');
  };

  // Tab content components - memoized to prevent focus loss
  const BasicInfoTabContent = useMemo(() => (
    <div className="tab-content">
      <div className="form-section">
        <h2>Personal Information</h2>
        <div className="form-row">
          <Input
            label="First Name *"
            name="firstName"
            value={staffData.firstName}
            onChange={handleFirstNameChange}
            onFocus={saveFocus}
            required
          />
          <Input
            label="Middle Name"
            name="middleName"
            value={staffData.middleName || ''}
            onChange={handleMiddleNameChange}
            onFocus={saveFocus}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Last Name"
            name="lastName"
            value={staffData.lastName || ''}
            onChange={handleLastNameChange}
            onFocus={saveFocus}
          />
          <Input
            label="Preferred Name"
            name="preferredName"
            value={staffData.preferredName || ''}
            onChange={handlePreferredNameChange}
            onFocus={saveFocus}
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Contact Information</h2>
        <div className="form-row">
          <Input
            label="Email *"
            name="email"
            type="email"
            value={staffData.email}
            onChange={handleEmailChange}
            onFocus={saveFocus}
            required
          />
          <Input
            label="Work Phone"
            name="phoneWork"
            value={staffData.phoneWork || ''}
            onChange={handlePhoneWorkChange}
            onFocus={saveFocus}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Mobile Phone"
            name="phoneMobile"
            value={staffData.phoneMobile || ''}
            onChange={handlePhoneMobileChange}
            onFocus={saveFocus}
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Employment Information</h2>
        <div className="form-row">
          <Input
            label="Job Role"
            name="jobRole"
            value={staffData.jobRole || ''}
            onChange={handleJobRoleChange}
            onFocus={saveFocus}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Department"
            name="department"
            value={staffData.department || ''}
            onChange={handleDepartmentChange}
            onFocus={saveFocus}
          />
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={staffData.startDate || ''}
            onChange={handleStartDateChange}
            onFocus={saveFocus}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={staffData.endDate || ''}
            onChange={handleEndDateChange}
            onFocus={saveFocus}
          />
        </div>
      </div>
    </div>
  ), [staffData, handleFirstNameChange, handleMiddleNameChange, handleLastNameChange, handlePreferredNameChange, handleEmailChange, handlePhoneWorkChange, handlePhoneMobileChange, handleJobRoleChange, handleDepartmentChange, handleStartDateChange, handleEndDateChange, saveFocus]);

  const BasicInfoTab = () => BasicInfoTabContent;

  const AddressTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <h2>Address Information</h2>
        <div className="form-row">
          <Input
            label="Address Line 1"
            name="addressLine1"
            value={staffData.address?.line1 || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value } 
            }))}
            onFocus={saveFocus}
          />
          <Input
            label="Address Line 2"
            name="addressLine2"
            value={staffData.address?.line2 || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, line2: e.target.value } 
            }))}
            onFocus={saveFocus}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="City"
            name="city"
            value={staffData.address?.city || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, city: e.target.value } 
            }))}
            onFocus={saveFocus}
          />
          <Input
            label="State"
            name="state"
            value={staffData.address?.state || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, state: e.target.value } 
            }))}
            onFocus={saveFocus}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Postal Code"
            name="postalCode"
            value={staffData.address?.postalCode || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, postalCode: e.target.value } 
            }))}
            onFocus={saveFocus}
          />
          <Input
            label="Country"
            name="country"
            value={staffData.address?.country || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, country: e.target.value } 
            }))}
            onFocus={saveFocus}
          />
        </div>
      </div>
    </div>
  );

  const EmergencyContactsTab = () => {
    const contacts = staffData.emergencyContacts || [];
    const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
    const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
    const [currentContact, setCurrentContact] = useState<EmergencyContact>({
      name: '',
      relationship: '',
      daytimeTelephone: '',
      eveningTelephone: '',
      mobile: '',
      email: '',
      address: '',
      notes: '',
    });

    const openAddContactPopup = () => {
      setCurrentContact({
        name: '',
        relationship: '',
        daytimeTelephone: '',
        eveningTelephone: '',
        mobile: '',
        email: '',
        address: '',
        notes: '',
      });
      setEditingContactIndex(null);
      setIsContactPopupOpen(true);
    };

    const openEditContactPopup = (index: number) => {
      setCurrentContact({ ...contacts[index] });
      setEditingContactIndex(index);
      setIsContactPopupOpen(true);
    };

    const closeContactPopup = () => {
      setIsContactPopupOpen(false);
      setEditingContactIndex(null);
      setCurrentContact({
        name: '',
        relationship: '',
        daytimeTelephone: '',
        eveningTelephone: '',
        mobile: '',
        email: '',
        address: '',
        notes: '',
      });
    };

    const saveContact = () => {
      const updatedContacts = [...contacts];
      
      if (editingContactIndex !== null) {
        // Update existing contact
        updatedContacts[editingContactIndex] = { ...currentContact };
      } else {
        // Add new contact
        updatedContacts.push({ ...currentContact });
      }

      setStaffData({
        ...staffData,
        emergencyContacts: updatedContacts,
      });
      
      closeContactPopup();
    };

    const removeEmergencyContact = (index: number) => {
      if (window.confirm('Are you sure you want to remove this emergency contact?')) {
        setStaffData({
          ...staffData,
          emergencyContacts: contacts.filter((_, i) => i !== index),
        });
      }
    };

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <h2>Emergency Contacts</h2>
            <button
              type="button"
              className="btn-add-contact"
              onClick={openAddContactPopup}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="empty-state">
              <p>No emergency contacts added. Click "Add Contact" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Relationship</th>
                    <th>Daytime Phone</th>
                    <th>Evening Phone</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, index) => (
                    <tr key={index}>
                      <td>{contact.name || 'N/A'}</td>
                      <td>{contact.relationship || 'N/A'}</td>
                      <td>{contact.daytimeTelephone || 'N/A'}</td>
                      <td>{contact.eveningTelephone || 'N/A'}</td>
                      <td>{contact.mobile || 'N/A'}</td>
                      <td>{contact.email || 'N/A'}</td>
                      <td>{contact.address || 'N/A'}</td>
                      <td>{contact.notes || 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit-contact"
                            onClick={() => openEditContactPopup(index)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => removeEmergencyContact(index)}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Popup
          isOpen={isContactPopupOpen}
          onClose={closeContactPopup}
          title={editingContactIndex !== null ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          width="700px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveContact}
        >
          <form className="contact-popup-form">
            <div className="form-row">
              <Input
                label="Name"
                name="contact-name"
                value={currentContact.name || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Relationship"
                name="contact-relationship"
                value={currentContact.relationship || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, relationship: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="Daytime Telephone"
                name="contact-daytime"
                value={currentContact.daytimeTelephone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, daytimeTelephone: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Evening Telephone"
                name="contact-evening"
                value={currentContact.eveningTelephone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, eveningTelephone: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="Mobile"
                name="contact-mobile"
                value={currentContact.mobile || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, mobile: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Email"
                name="contact-email"
                type="email"
                value={currentContact.email || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="Address"
                name="contact-address"
                value={currentContact.address || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, address: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <TextField
                label="Notes"
                name="contact-notes"
                value={currentContact.notes || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, notes: e.target.value })}
                rows={4}
              />
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  const DBSTab = () => {
    const dbs = staffData.dbs || {};
    const [activeDBSTab, setActiveDBSTab] = useState('basic');

    const updateDBSField = (field: keyof DBS, value: string | undefined) => {
      setStaffData({
        ...staffData,
        dbs: {
          ...dbs,
          [field]: value,
        },
      });
    };

    const updateDBSNestedField = (nestedObject: keyof DBS, field: string, value: string | boolean | undefined) => {
      const currentNested = dbs[nestedObject] as Record<string, unknown> | undefined;
      setStaffData({
        ...staffData,
        dbs: {
          ...dbs,
          [nestedObject]: {
            ...(currentNested || {}),
            [field]: value,
          },
        },
      });
    };

    // Basic DBS Information Tab
    const BasicDBSTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <Input
              label="Staff Member"
              name="dbs-staff-member"
              value={dbs.staffMember || ''}
              onChange={(e) => updateDBSField('staffMember', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Check Level"
              name="dbs-check-level"
              value={dbs.checkLevel || ''}
              onChange={(e) => updateDBSField('checkLevel', e.target.value)}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <Input
              label="Application Sent Date"
              name="dbs-application-sent-date"
              type="date"
              value={dbs.applicationSentDate ? dbs.applicationSentDate.split('T')[0] : ''}
              onChange={(e) => updateDBSField('applicationSentDate', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Application Reference Number"
              name="dbs-application-ref-number"
              value={dbs.applicationReferenceNumber || ''}
              onChange={(e) => updateDBSField('applicationReferenceNumber', e.target.value)}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <Input
              label="Certificate Date Received"
              name="dbs-certificate-date-received"
              type="date"
              value={dbs.certificateDateReceived ? dbs.certificateDateReceived.split('T')[0] : ''}
              onChange={(e) => updateDBSField('certificateDateReceived', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Certificate Number"
              name="dbs-certificate-number"
              value={dbs.certificateNumber || ''}
              onChange={(e) => updateDBSField('certificateNumber', e.target.value)}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <Input
              label="DBS Seen By"
              name="dbs-seen-by"
              value={dbs.dbsSeenBy || ''}
              onChange={(e) => updateDBSField('dbsSeenBy', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="DBS Checked Date"
              name="dbs-checked-date"
              type="date"
              value={dbs.dbsCheckedDate ? dbs.dbsCheckedDate.split('T')[0] : ''}
              onChange={(e) => updateDBSField('dbsCheckedDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <Input
              label="Update Service ID"
              name="dbs-update-service-id"
              value={dbs.updateServiceId || ''}
              onChange={(e) => updateDBSField('updateServiceId', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Update Service Check Date"
              name="dbs-update-service-check-date"
              type="date"
              value={dbs.updateServiceCheckDate ? dbs.updateServiceCheckDate.split('T')[0] : ''}
              onChange={(e) => updateDBSField('updateServiceCheckDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    // Right to Work Tab
    const RightToWorkTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <Input
              label="Type"
              name="right-to-work-type"
              value={dbs.rightToWork?.type || ''}
              onChange={(e) => updateDBSNestedField('rightToWork', 'type', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Verified Date"
              name="right-to-work-verified-date"
              type="date"
              value={dbs.rightToWork?.verifiedDate ? dbs.rightToWork.verifiedDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('rightToWork', 'verifiedDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <Input
              label="Expiry"
              name="right-to-work-expiry"
              type="date"
              value={dbs.rightToWork?.expiry ? dbs.rightToWork.expiry.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('rightToWork', 'expiry', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Evidence"
              name="right-to-work-evidence"
              value={dbs.rightToWork?.evidence || ''}
              onChange={(e) => updateDBSNestedField('rightToWork', 'evidence', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    // Overseas Check Tab
    const OverseasCheckTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.overseas?.checkNeeded || false}
                  onChange={(e) => updateDBSNestedField('overseas', 'checkNeeded', e.target.checked)}
                />
                Check Needed
              </label>
            </div>
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.overseas?.evidenceProduced || false}
                  onChange={(e) => updateDBSNestedField('overseas', 'evidenceProduced', e.target.checked)}
                />
                Evidence Produced
              </label>
            </div>
          </div>

          <div className="form-row">
            <Input
              label="Check Date"
              name="overseas-check-date"
              type="date"
              value={dbs.overseas?.checkDate ? dbs.overseas.checkDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('overseas', 'checkDate', e.target.value)}
              onFocus={saveFocus}
            />
            <Input
              label="Upload Evidence"
              name="overseas-upload-evidence"
              value={dbs.overseas?.uploadEvidence || ''}
              onChange={(e) => updateDBSNestedField('overseas', 'uploadEvidence', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    // Children Barred List Check Tab
    const ChildrenBarredListTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.childrenBarredListCheck?.completed || false}
                  onChange={(e) => updateDBSNestedField('childrenBarredListCheck', 'completed', e.target.checked)}
                />
                Completed
              </label>
            </div>
            <Input
              label="Check Date"
              name="children-barred-check-date"
              type="date"
              value={dbs.childrenBarredListCheck?.checkDate ? dbs.childrenBarredListCheck.checkDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('childrenBarredListCheck', 'checkDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    // Prohibition from Teaching Tab
    const ProhibitionFromTeachingTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.prohibitionFromTeaching?.checked || false}
                  onChange={(e) => updateDBSNestedField('prohibitionFromTeaching', 'checked', e.target.checked)}
                />
                Checked
              </label>
            </div>
            <Input
              label="Check Date"
              name="prohibition-teaching-check-date"
              type="date"
              value={dbs.prohibitionFromTeaching?.checkDate ? dbs.prohibitionFromTeaching.checkDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('prohibitionFromTeaching', 'checkDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    // Prohibition from Management Tab
    const ProhibitionFromManagementTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.prohibitionFromManagement?.completed || false}
                  onChange={(e) => updateDBSNestedField('prohibitionFromManagement', 'completed', e.target.checked)}
                />
                Completed
              </label>
            </div>
            <Input
              label="Check Date"
              name="prohibition-management-check-date"
              type="date"
              value={dbs.prohibitionFromManagement?.checkDate ? dbs.prohibitionFromManagement.checkDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('prohibitionFromManagement', 'checkDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Notes"
              name="prohibition-management-notes"
              value={dbs.prohibitionFromManagement?.notes || ''}
              onChange={(e) => updateDBSNestedField('prohibitionFromManagement', 'notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    );

    // Disqualification under Children Act Tab
    const DisqualificationUnderChildrenActTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.disqualificationUnderChildrenAct?.completed || false}
                  onChange={(e) => updateDBSNestedField('disqualificationUnderChildrenAct', 'completed', e.target.checked)}
                />
                Completed
              </label>
            </div>
            <Input
              label="Check Date"
              name="disqualification-children-act-check-date"
              type="date"
              value={dbs.disqualificationUnderChildrenAct?.checkDate ? dbs.disqualificationUnderChildrenAct.checkDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('disqualificationUnderChildrenAct', 'checkDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    // Disqualified by Association Tab
    const DisqualifiedByAssociationTab = () => (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-row">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={dbs.disqualifiedByAssociation?.completed || false}
                  onChange={(e) => updateDBSNestedField('disqualifiedByAssociation', 'completed', e.target.checked)}
                />
                Completed
              </label>
            </div>
            <Input
              label="Checked Date"
              name="disqualified-association-checked-date"
              type="date"
              value={dbs.disqualifiedByAssociation?.checkedDate ? dbs.disqualifiedByAssociation.checkedDate.split('T')[0] : ''}
              onChange={(e) => updateDBSNestedField('disqualifiedByAssociation', 'checkedDate', e.target.value)}
              onFocus={saveFocus}
            />
          </div>
        </div>
      </div>
    );

    const dbsTabs = [
      { id: 'basic', label: 'Basic DBS', content: <BasicDBSTab /> },
      { id: 'rightToWork', label: 'Right to Work', content: <RightToWorkTab /> },
      { id: 'overseas', label: 'Overseas Check', content: <OverseasCheckTab /> },
      { id: 'childrenBarred', label: 'Children Barred List', content: <ChildrenBarredListTab /> },
      { id: 'prohibitionTeaching', label: 'Prohibition from Teaching', content: <ProhibitionFromTeachingTab /> },
      { id: 'prohibitionManagement', label: 'Prohibition from Management', content: <ProhibitionFromManagementTab /> },
      { id: 'disqualificationChildrenAct', label: 'Disqualification (Children Act)', content: <DisqualificationUnderChildrenActTab /> },
      { id: 'disqualifiedAssociation', label: 'Disqualified by Association', content: <DisqualifiedByAssociationTab /> },
    ];

    return (
      <div className="tab-content">
        <Tabs 
          tabs={dbsTabs} 
          activeTab={activeDBSTab} 
          onTabChange={setActiveDBSTab} 
        />
      </div>
    );
  };

  const CPDTrainingTab = () => {
    const trainingRecords = staffData.cpdTraining || [];
    const [isTrainingPopupOpen, setIsTrainingPopupOpen] = useState(false);
    const [editingTrainingIndex, setEditingTrainingIndex] = useState<number | null>(null);
    const [currentTraining, setCurrentTraining] = useState<TrainingRecord>({
      courseName: '',
      dateCompleted: '',
      expiryDate: '',
      status: '',
      notes: '',
      uploadCertificate: '',
    });

    const openAddTrainingPopup = () => {
      setCurrentTraining({
        courseName: '',
        dateCompleted: '',
        expiryDate: '',
        status: '',
        notes: '',
        uploadCertificate: '',
      });
      setEditingTrainingIndex(null);
      setIsTrainingPopupOpen(true);
    };

    const openEditTrainingPopup = (index: number) => {
      setCurrentTraining({ ...trainingRecords[index] });
      setEditingTrainingIndex(index);
      setIsTrainingPopupOpen(true);
    };

    const closeTrainingPopup = () => {
      setIsTrainingPopupOpen(false);
      setEditingTrainingIndex(null);
      setCurrentTraining({
        courseName: '',
        dateCompleted: '',
        expiryDate: '',
        status: '',
        notes: '',
        uploadCertificate: '',
      });
    };

    const saveTraining = () => {
      if (!currentTraining.courseName.trim()) {
        alert('Course Name is required');
        return;
      }

      const updatedTraining = [...trainingRecords];
      
      if (editingTrainingIndex !== null) {
        // Update existing training
        updatedTraining[editingTrainingIndex] = { ...currentTraining };
      } else {
        // Add new training
        updatedTraining.push({ ...currentTraining });
      }

      setStaffData({
        ...staffData,
        cpdTraining: updatedTraining,
      });
      
      closeTrainingPopup();
    };

    const removeTraining = (index: number) => {
      if (window.confirm('Are you sure you want to remove this training record?')) {
        setStaffData({
          ...staffData,
          cpdTraining: trainingRecords.filter((_, i) => i !== index),
        });
      }
    };

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <h2>CPD Training</h2>
            <button
              type="button"
              className="btn-add-contact"
              onClick={openAddTrainingPopup}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Training
            </button>
          </div>

          {trainingRecords.length === 0 ? (
            <div className="empty-state">
              <p>No CPD training records added. Click "Add Training" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Date Completed</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingRecords.map((training, index) => (
                    <tr key={index}>
                      <td>{training.courseName || 'N/A'}</td>
                      <td>{training.dateCompleted ? training.dateCompleted.split('T')[0] : 'N/A'}</td>
                      <td>{training.expiryDate ? training.expiryDate.split('T')[0] : 'N/A'}</td>
                      <td>{training.status || 'N/A'}</td>
                      <td>{training.notes || 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit-contact"
                            onClick={() => openEditTrainingPopup(index)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => removeTraining(index)}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Popup
          isOpen={isTrainingPopupOpen}
          onClose={closeTrainingPopup}
          title={editingTrainingIndex !== null ? 'Edit CPD Training' : 'Add CPD Training'}
          width="700px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveTraining}
        >
          <form className="contact-popup-form">
            <div className="form-row">
              <Input
                label="Course Name *"
                name="training-course-name"
                value={currentTraining.courseName}
                onChange={(e) => setCurrentTraining({ ...currentTraining, courseName: e.target.value })}
                onFocus={saveFocus}
                required
              />
              <Select
                label="Status"
                name="training-status"
                value={currentTraining.status || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentTraining({ ...currentTraining, status: e.target.value })}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'expired', label: 'Expired' },
                ]}
                placeholder="Select Status"
              />
            </div>

            <div className="form-row">
              <Input
                label="Date Completed"
                name="training-date-completed"
                type="date"
                value={currentTraining.dateCompleted ? currentTraining.dateCompleted.split('T')[0] : ''}
                onChange={(e) => setCurrentTraining({ ...currentTraining, dateCompleted: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Expiry Date"
                name="training-expiry-date"
                type="date"
                value={currentTraining.expiryDate ? currentTraining.expiryDate.split('T')[0] : ''}
                onChange={(e) => setCurrentTraining({ ...currentTraining, expiryDate: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <div className="file-input-field">
                <label htmlFor="training-upload-certificate">Upload Certificate</label>
                <input
                  id="training-upload-certificate"
                  type="file"
                  name="training-upload-certificate"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Store file name or handle file upload
                      // For now, storing the file name
                      setCurrentTraining({ ...currentTraining, uploadCertificate: file.name });
                    }
                  }}
                />
                {currentTraining.uploadCertificate && (
                  <span className="file-name">{currentTraining.uploadCertificate}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <TextField
                label="Notes"
                name="training-notes"
                value={currentTraining.notes || ''}
                onChange={(e) => setCurrentTraining({ ...currentTraining, notes: e.target.value })}
                rows={4}
              />
            </div>
          </form>
        </Popup>
      </div>
    );
  };

 

  const QualificationsTab = () => {
    const qualifications = staffData.qualifications || [];
    const [isQualificationPopupOpen, setIsQualificationPopupOpen] = useState(false);
    const [editingQualificationIndex, setEditingQualificationIndex] = useState<number | null>(null);
    const [currentQualification, setCurrentQualification] = useState<Qualification>({
      qualificationName: '',
      qualificationType: '',
      classOfDegree: '',
      achievedDate: '',
      expiryDate: '',
      subject1: '',
      subject2: '',
      qtStatus: '',
      nqtEctStatus: '',
      npqhQualification: false,
      ccrsQualification: false,
      notes: '',
      uploadQualificationEvidence: '',
    });

    const openAddQualificationPopup = () => {
      setCurrentQualification({
        qualificationName: '',
        qualificationType: '',
        classOfDegree: '',
        achievedDate: '',
        expiryDate: '',
        subject1: '',
        subject2: '',
        qtStatus: '',
        nqtEctStatus: '',
        npqhQualification: false,
        ccrsQualification: false,
        notes: '',
        uploadQualificationEvidence: '',
      });
      setEditingQualificationIndex(null);
      setIsQualificationPopupOpen(true);
    };

    const openEditQualificationPopup = (index: number) => {
      setCurrentQualification({ ...qualifications[index] });
      setEditingQualificationIndex(index);
      setIsQualificationPopupOpen(true);
    };

    const closeQualificationPopup = () => {
      setIsQualificationPopupOpen(false);
      setEditingQualificationIndex(null);
      setCurrentQualification({
        qualificationName: '',
        qualificationType: '',
        classOfDegree: '',
        achievedDate: '',
        expiryDate: '',
        subject1: '',
        subject2: '',
        qtStatus: '',
        nqtEctStatus: '',
        npqhQualification: false,
        ccrsQualification: false,
        notes: '',
        uploadQualificationEvidence: '',
      });
    };

    const saveQualification = () => {
      if (!currentQualification.qualificationName.trim()) {
        alert('Qualification Name is required');
        return;
      }

      const updatedQualifications = [...qualifications];
      
      if (editingQualificationIndex !== null) {
        // Update existing qualification
        updatedQualifications[editingQualificationIndex] = { ...currentQualification };
      } else {
        // Add new qualification
        updatedQualifications.push({ ...currentQualification });
      }

      setStaffData({
        ...staffData,
        qualifications: updatedQualifications,
      });
      
      closeQualificationPopup();
    };

    const removeQualification = (index: number) => {
      if (window.confirm('Are you sure you want to remove this qualification?')) {
        setStaffData({
          ...staffData,
          qualifications: qualifications.filter((_, i) => i !== index),
        });
      }
    };

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <h2>Qualifications</h2>
            <button
              type="button"
              className="btn-add-contact"
              onClick={openAddQualificationPopup}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Qualification
            </button>
          </div>

          {qualifications.length === 0 ? (
            <div className="empty-state">
              <p>No qualifications added. Click "Add Qualification" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Qualification Name</th>
                    <th>Type</th>
                    <th>Class of Degree</th>
                    <th>Achieved Date</th>
                    <th>Expiry Date</th>
                    <th>QT Status</th>
                    <th>NQT/ECT Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {qualifications.map((qualification, index) => (
                    <tr key={index}>
                      <td>{qualification.qualificationName || 'N/A'}</td>
                      <td>{qualification.qualificationType || 'N/A'}</td>
                      <td>{qualification.classOfDegree || 'N/A'}</td>
                      <td>{qualification.achievedDate ? qualification.achievedDate.split('T')[0] : 'N/A'}</td>
                      <td>{qualification.expiryDate ? qualification.expiryDate.split('T')[0] : 'N/A'}</td>
                      <td>{qualification.qtStatus || 'N/A'}</td>
                      <td>{qualification.nqtEctStatus || 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit-contact"
                            onClick={() => openEditQualificationPopup(index)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => removeQualification(index)}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Popup
          isOpen={isQualificationPopupOpen}
          onClose={closeQualificationPopup}
          title={editingQualificationIndex !== null ? 'Edit Qualification' : 'Add Qualification'}
          width="800px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveQualification}
        >
          <form className="contact-popup-form">
            <div className="form-row">
              <Input
                label="Qualification Name *"
                name="qualification-name"
                value={currentQualification.qualificationName}
                onChange={(e) => setCurrentQualification({ ...currentQualification, qualificationName: e.target.value })}
                onFocus={saveFocus}
                required
              />
              <Input
                label="Qualification Type"
                name="qualification-type"
                value={currentQualification.qualificationType || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, qualificationType: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="Class of Degree"
                name="qualification-class-degree"
                value={currentQualification.classOfDegree || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, classOfDegree: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="QT Status"
                name="qualification-qt-status"
                value={currentQualification.qtStatus || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, qtStatus: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="NQT/ECT Status"
                name="qualification-nqt-ect-status"
                value={currentQualification.nqtEctStatus || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, nqtEctStatus: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Subject 1"
                name="qualification-subject1"
                value={currentQualification.subject1 || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, subject1: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="Subject 2"
                name="qualification-subject2"
                value={currentQualification.subject2 || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, subject2: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <Input
                label="Achieved Date"
                name="qualification-achieved-date"
                type="date"
                value={currentQualification.achievedDate ? currentQualification.achievedDate.split('T')[0] : ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, achievedDate: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Expiry Date"
                name="qualification-expiry-date"
                type="date"
                value={currentQualification.expiryDate ? currentQualification.expiryDate.split('T')[0] : ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, expiryDate: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentQualification.npqhQualification || false}
                    onChange={(e) => setCurrentQualification({ ...currentQualification, npqhQualification: e.target.checked })}
                  />
                  NPQH Qualification
                </label>
              </div>
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentQualification.ccrsQualification || false}
                    onChange={(e) => setCurrentQualification({ ...currentQualification, ccrsQualification: e.target.checked })}
                  />
                  CCRS Qualification
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="file-input-field">
                <label htmlFor="qualification-upload-evidence">Upload Qualification Evidence</label>
                <input
                  id="qualification-upload-evidence"
                  type="file"
                  name="qualification-upload-evidence"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCurrentQualification({ ...currentQualification, uploadQualificationEvidence: file.name });
                    }
                  }}
                />
                {currentQualification.uploadQualificationEvidence && (
                  <span className="file-name">{currentQualification.uploadQualificationEvidence}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <TextField
                label="Notes"
                name="qualification-notes"
                value={currentQualification.notes || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, notes: e.target.value })}
                rows={4}
              />
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  const HRTab = () => {
    const hrRecords = staffData.hr || [];
    const [isHRPopupOpen, setIsHRPopupOpen] = useState(false);
    const [editingHRIndex, setEditingHRIndex] = useState<number | null>(null);
    const [currentHR, setCurrentHR] = useState<HRRecord>({
      absenceType: '',
      absenceDate: '',
      reason: '',
      evidenceUpload: '',
    });

    const openAddHRPopup = () => {
      setCurrentHR({
        absenceType: '',
        absenceDate: '',
        reason: '',
        evidenceUpload: '',
      });
      setEditingHRIndex(null);
      setIsHRPopupOpen(true);
    };

    const openEditHRPopup = (index: number) => {
      setCurrentHR({ ...hrRecords[index] });
      setEditingHRIndex(index);
      setIsHRPopupOpen(true);
    };

    const closeHRPopup = () => {
      setIsHRPopupOpen(false);
      setEditingHRIndex(null);
      setCurrentHR({
        absenceType: '',
        absenceDate: '',
        reason: '',
        evidenceUpload: '',
      });
    };

    const saveHR = () => {
      const updatedHR = [...hrRecords];
      
      if (editingHRIndex !== null) {
        // Update existing HR record
        updatedHR[editingHRIndex] = { ...currentHR };
      } else {
        // Add new HR record
        updatedHR.push({ ...currentHR });
      }

      setStaffData({
        ...staffData,
        hr: updatedHR,
      });
      
      closeHRPopup();
    };

    const removeHR = (index: number) => {
      if (window.confirm('Are you sure you want to remove this HR record?')) {
        setStaffData({
          ...staffData,
          hr: hrRecords.filter((_, i) => i !== index),
        });
      }
    };

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <h2>HR Records</h2>
            <button
              type="button"
              className="btn-add-contact"
              onClick={openAddHRPopup}
            >
              <FontAwesomeIcon icon={faPlus} /> Add HR Record
            </button>
          </div>

          {hrRecords.length === 0 ? (
            <div className="empty-state">
              <p>No HR records added. Click "Add HR Record" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Absence Type</th>
                    <th>Absence Date</th>
                    <th>Reason</th>
                    <th>Evidence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hrRecords.map((hr, index) => (
                    <tr key={index}>
                      <td>{hr.absenceType || 'N/A'}</td>
                      <td>{hr.absenceDate ? hr.absenceDate.split('T')[0] : 'N/A'}</td>
                      <td>{hr.reason || 'N/A'}</td>
                      <td>{hr.evidenceUpload || 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit-contact"
                            onClick={() => openEditHRPopup(index)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => removeHR(index)}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Popup
          isOpen={isHRPopupOpen}
          onClose={closeHRPopup}
          title={editingHRIndex !== null ? 'Edit HR Record' : 'Add HR Record'}
          width="700px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveHR}
        >
          <form className="contact-popup-form">
            <div className="form-row">
              <Input
                label="Absence Type"
                name="hr-absence-type"
                value={currentHR.absenceType || ''}
                onChange={(e) => setCurrentHR({ ...currentHR, absenceType: e.target.value })}
                onFocus={saveFocus}
              />
              <Input
                label="Absence Date"
                name="hr-absence-date"
                type="date"
                value={currentHR.absenceDate ? currentHR.absenceDate.split('T')[0] : ''}
                onChange={(e) => setCurrentHR({ ...currentHR, absenceDate: e.target.value })}
                onFocus={saveFocus}
              />
            </div>

            <div className="form-row">
              <TextField
                label="Reason"
                name="hr-reason"
                value={currentHR.reason || ''}
                onChange={(e) => setCurrentHR({ ...currentHR, reason: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="file-input-field">
                <label htmlFor="hr-evidence-upload">Upload Evidence</label>
                <input
                  id="hr-evidence-upload"
                  type="file"
                  name="hr-evidence-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCurrentHR({ ...currentHR, evidenceUpload: file.name });
                    }
                  }}
                />
                {currentHR.evidenceUpload && (
                  <span className="file-name">{currentHR.evidenceUpload}</span>
                )}
              </div>
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  const MedicalNeedsTab = () => {
    const medicalNeeds = staffData.medicalNeeds || {};
    const doctorContacts = medicalNeeds.doctorContactDetails || [];
    const [isDoctorPopupOpen, setIsDoctorPopupOpen] = useState(false);
    const [editingDoctorIndex, setEditingDoctorIndex] = useState<number | null>(null);
    const [currentDoctor, setCurrentDoctor] = useState<DoctorContact>({
      name: '',
      relationship: '',
      mobile: '',
      daytimePhone: '',
      eveningPhone: '',
      email: '',
    });

    const openAddDoctorPopup = () => {
      setCurrentDoctor({
        name: '',
        relationship: '',
        mobile: '',
        daytimePhone: '',
        eveningPhone: '',
        email: '',
      });
      setEditingDoctorIndex(null);
      setIsDoctorPopupOpen(true);
    };

    const openEditDoctorPopup = (index: number) => {
      setCurrentDoctor({ ...doctorContacts[index] });
      setEditingDoctorIndex(index);
      setIsDoctorPopupOpen(true);
    };

    const closeDoctorPopup = () => {
      setIsDoctorPopupOpen(false);
      setEditingDoctorIndex(null);
      setCurrentDoctor({
        name: '',
        relationship: '',
        mobile: '',
        daytimePhone: '',
        eveningPhone: '',
        email: '',
      });
    };

    const saveDoctor = () => {
      const updatedContacts = [...doctorContacts];
      
      if (editingDoctorIndex !== null) {
        updatedContacts[editingDoctorIndex] = { ...currentDoctor };
      } else {
        updatedContacts.push({ ...currentDoctor });
      }

      setStaffData({
        ...staffData,
        medicalNeeds: {
          ...medicalNeeds,
          doctorContactDetails: updatedContacts,
        },
      });
      
      closeDoctorPopup();
    };

    const removeDoctor = (index: number) => {
      if (window.confirm('Are you sure you want to remove this doctor contact?')) {
        setStaffData({
          ...staffData,
          medicalNeeds: {
            ...medicalNeeds,
            doctorContactDetails: doctorContacts.filter((_, i) => i !== index),
          },
        });
      }
    };

    return (
      <div className="tab-content">
        <div className="form-section">
          <h2>Medical Needs</h2>

          <div className="form-row">
            <TextField
              label="Medical Description"
              name="medical-description"
              value={medicalNeeds.medicalDescription || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, medicalDescription: e.target.value },
              })}
              rows={4}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Conditions / Syndrome"
              name="conditions-syndrome"
              value={medicalNeeds.conditionsSyndrome || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, conditionsSyndrome: e.target.value },
              })}
              rows={4}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Medication"
              name="medication"
              value={medicalNeeds.medication || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, medication: e.target.value },
              })}
              rows={4}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Special Diet"
              name="special-diet"
              value={medicalNeeds.specialDiet || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, specialDiet: e.target.value },
              })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Impairments"
              name="impairments"
              value={medicalNeeds.impairments || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, impairments: e.target.value },
              })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Allergies"
              name="allergies"
              value={medicalNeeds.allergies || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, allergies: e.target.value },
              })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Assistance Required"
              name="assistance-required"
              value={medicalNeeds.assistanceRequired || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, assistanceRequired: e.target.value },
              })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <Input
              label="NHS Number"
              name="nhs-number"
              value={medicalNeeds.nhsNumber || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, nhsNumber: e.target.value },
              })}
              onFocus={saveFocus}
            />
            <Input
              label="Blood Group"
              name="blood-group"
              value={medicalNeeds.bloodGroup || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, bloodGroup: e.target.value },
              })}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <Input
              label="Last Medical Check"
              name="last-medical-check"
              type="date"
              value={medicalNeeds.lastMedicalCheck ? medicalNeeds.lastMedicalCheck.split('T')[0] : ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, lastMedicalCheck: e.target.value },
              })}
              onFocus={saveFocus}
            />
          </div>

          <div className="form-row">
            <TextField
              label="Medical Notes"
              name="medical-notes"
              value={medicalNeeds.medicalNotes || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, medicalNotes: e.target.value },
              })}
              rows={4}
            />
          </div>

          <div className="form-section" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2>Doctor Contact Details</h2>
              <button
                type="button"
                className="btn-add-contact"
                onClick={openAddDoctorPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Doctor Contact
              </button>
            </div>

            {doctorContacts.length === 0 ? (
              <div className="empty-state">
                <p>No doctor contacts added. Click "Add Doctor Contact" to add one.</p>
              </div>
            ) : (
              <div className="contacts-table-container">
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relationship</th>
                      <th>Mobile</th>
                      <th>Daytime Phone</th>
                      <th>Evening Phone</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorContacts.map((contact, index) => (
                      <tr key={index}>
                        <td>{contact.name || 'N/A'}</td>
                        <td>{contact.relationship || 'N/A'}</td>
                        <td>{contact.mobile || 'N/A'}</td>
                        <td>{contact.daytimePhone || 'N/A'}</td>
                        <td>{contact.eveningPhone || 'N/A'}</td>
                        <td>{contact.email || 'N/A'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn-edit-contact"
                              onClick={() => openEditDoctorPopup(index)}
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              type="button"
                              className="btn-remove-contact"
                              onClick={() => removeDoctor(index)}
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Popup
            isOpen={isDoctorPopupOpen}
            onClose={closeDoctorPopup}
            title={editingDoctorIndex !== null ? 'Edit Doctor Contact' : 'Add Doctor Contact'}
            width="700px"
            confirmText="Save"
            cancelText="Cancel"
            onConfirm={saveDoctor}
          >
            <form className="contact-popup-form">
              <div className="form-row">
                <Input
                  label="Name"
                  name="doctor-name"
                  value={currentDoctor.name || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, name: e.target.value })}
                  onFocus={saveFocus}
                />
                <Input
                  label="Relationship"
                  name="doctor-relationship"
                  value={currentDoctor.relationship || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, relationship: e.target.value })}
                  onFocus={saveFocus}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Mobile"
                  name="doctor-mobile"
                  value={currentDoctor.mobile || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, mobile: e.target.value })}
                  onFocus={saveFocus}
                />
                <Input
                  label="Daytime Phone"
                  name="doctor-daytime-phone"
                  value={currentDoctor.daytimePhone || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, daytimePhone: e.target.value })}
                  onFocus={saveFocus}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Evening Phone"
                  name="doctor-evening-phone"
                  value={currentDoctor.eveningPhone || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, eveningPhone: e.target.value })}
                  onFocus={saveFocus}
                />
                <Input
                  label="Email"
                  name="doctor-email"
                  type="email"
                  value={currentDoctor.email || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
                  onFocus={saveFocus}
                />
              </div>
            </form>
          </Popup>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information', content: <BasicInfoTab /> },
    { id: 'address', label: 'Address', content: <AddressTab /> },
    { id: 'emergency', label: 'Emergency Contacts', content: <EmergencyContactsTab /> },
    { id: 'dbs', label: 'DBS', content: <DBSTab /> },
    { id: 'cpd', label: 'CPD and Safeguarding Training', content: <CPDTrainingTab /> },
    { id: 'qualifications', label: 'Qualifications', content: <QualificationsTab /> },
    { id: 'hr', label: 'HR', content: <HRTab /> },
    { id: 'medical', label: 'Medical Needs', content: <MedicalNeedsTab /> },
  ];

  return (
    <Layout>
      <div className="new-staff">
        <div className="new-staff-header">
          <h1>{id ? 'Edit Staff Member' : 'Add New Staff Member'}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="new-staff-form">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Staff' : 'Create Staff'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewStaff;