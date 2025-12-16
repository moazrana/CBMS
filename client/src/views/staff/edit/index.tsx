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
import DateInput from '../../../components/dateInput/DateInput';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import './index.scss';

interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
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
  workLocation?: string;
  startDate?: string;
  endDate?: string;
  address?: Address;
  emergencyContacts?: EmergencyContact[];
  dbs?: DBS[];
  cpdTraining?: TrainingRecord[];
  qualifications?: Qualification[];
  hr?: HRRecord[];
  medicalNeeds?: MedicalNeeds;
}

const EditStaff = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { executeRequest, loading } = useApiRequest();
  const [activeTab, setActiveTab] = useState('basic');
  const isEditMode = !!id;
  
  // Ref to track focused input
  const focusedInputRef = useRef<{ name: string; selectionStart: number | null; selectionEnd: number | null } | null>(null);

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
    workLocation: '',
    startDate: '',
    endDate: '',
    address: {},
    emergencyContacts: [],
    dbs: [],
    cpdTraining: [],
    qualifications: [],
    hr: [],
    medicalNeeds: {},
  });

  const [users, setUsers] = useState<Array<{ _id: string; name: string }>>([]);

  // Save cursor position from an element
  const saveCursorPosition = useCallback((element: HTMLInputElement | HTMLTextAreaElement) => {
    if (element && element.name) {
      focusedInputRef.current = {
        name: element.name,
        selectionStart: 'selectionStart' in element ? element.selectionStart : null,
        selectionEnd: 'selectionEnd' in element ? element.selectionEnd : null,
      };
    }
  }, []);

  // Save focus state before render
  const saveFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Clear focus ref if user is moving to a different element (allows Tab navigation)
    if (focusedInputRef.current && focusedInputRef.current.name !== e.target.name) {
      focusedInputRef.current = null;
    }
    saveCursorPosition(e.target);
  }, [saveCursorPosition]);

  // Wrapper for textarea focus events
  const saveFocusTextarea = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    saveFocus(e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>);
  }, [saveFocus]);
  
  // Restore focus after render - simple logic: only restore if no form element is focused
  useEffect(() => {
    if (!focusedInputRef.current) {
      return;
    }

    // Check if any form element is currently focused
    const activeElement = document.activeElement;
    const isFormElementFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.tagName === 'BUTTON'
    );

    // If a form element is focused, don't restore (user is navigating with Tab/click)
    if (isFormElementFocused) {
      return;
    }

    // Try to find both input and textarea elements
    const input = document.querySelector(`input[name="${focusedInputRef.current.name}"]`) as HTMLInputElement;
    const textarea = document.querySelector(`textarea[name="${focusedInputRef.current.name}"]`) as HTMLTextAreaElement;
    const element = input || textarea;
    
    // Only restore if element exists, is not focused, and is not a date input
    if (element && 
        document.activeElement !== element &&
        (!input || input.type !== 'date')) {
      element.focus();
      // Set cursor to end of text instead of saved position
      if (element.value) {
        const end = element.value.length;
        element.setSelectionRange(end, end);
      } else if (focusedInputRef.current.selectionStart !== null && 'setSelectionRange' in element) {
        // Fallback to saved position if no value
        const start = focusedInputRef.current.selectionStart;
        const end = focusedInputRef.current.selectionEnd !== null ? focusedInputRef.current.selectionEnd : start;
        element.setSelectionRange(start, end);
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
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, email: e.target.value }));
  }, []);
  
  const handlePhoneWorkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, phoneWork: e.target.value }));
  }, []);
  
  const handlePhoneMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, phoneMobile: e.target.value }));
  }, []);
  
  const handleJobRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStaffData((prev) => ({ ...prev, jobRole: e.target.value }));
    // Trigger autosave on change for dropdown
    setTimeout(() => {
      const currentData = staffDataRef.current;
      const currentId = staffIdRef.current;
      if (currentData.firstName && currentData.email && currentId) {
        // Use the same autosave pattern as handleAutosave
        const cleanedData = cleanEmptyDateStrings(currentData);
        api.patch(`/staff/${currentId}`, cleanedData).catch((error) => {
          console.error('Autosave error:', error);
        });
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, department: e.target.value }));
  }, []);

  const handleWorkLocationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStaffData((prev) => ({ ...prev, workLocation: e.target.value }));
    // Trigger autosave on change for dropdown
    setTimeout(() => {
      const currentData = staffDataRef.current;
      const currentId = staffIdRef.current;
      if (currentData.firstName && currentData.email && currentId) {
        // Use the same autosave pattern as handleAutosave
        const cleanedData = cleanEmptyDateStrings(currentData);
        api.patch(`/staff/${currentId}`, cleanedData).catch((error) => {
          console.error('Autosave error:', error);
        });
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, startDate: e.target.value }));
  }, []);
  
  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffData((prev) => ({ ...prev, endDate: e.target.value }));
  }, []);

  // Redirect if no id in edit mode
  useEffect(() => {
    console.log('use effect 1')
    if (isEditMode && !id) {
      navigate('/staff');
    }
  }, [isEditMode, id, navigate]);

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      const response = await executeRequest('get', `/staff/${id}`);
      const profile = response.profile || {};
      setStaffData({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        preferredName: profile.preferredName || '',
        email: response.email || '',
        phoneWork: profile.phoneWork || '',
        phoneMobile: profile.phoneMobile || '',
        jobRole: profile.jobRole || '',
        department: profile.department || '',
        workLocation: profile.workLocation || '',
        startDate: profile.startDate ? profile.startDate.split('T')[0] : '',
        endDate: profile.endDate ? profile.endDate.split('T')[0] : '',
        address: profile.address || {},
        emergencyContacts: response.emergencyContacts || [],
        dbs: Array.isArray(response.dbs) ? response.dbs.map((dbsItem: DBS) => ({
          ...dbsItem,
          applicationSentDate: dbsItem.applicationSentDate ? dbsItem.applicationSentDate.split('T')[0] : undefined,
          certificateDateReceived: dbsItem.certificateDateReceived ? dbsItem.certificateDateReceived.split('T')[0] : undefined,
          dbsCheckedDate: dbsItem.dbsCheckedDate ? dbsItem.dbsCheckedDate.split('T')[0] : undefined,
          updateServiceCheckDate: dbsItem.updateServiceCheckDate ? dbsItem.updateServiceCheckDate.split('T')[0] : undefined,
          rightToWork: dbsItem.rightToWork ? {
            ...dbsItem.rightToWork,
            verifiedDate: dbsItem.rightToWork.verifiedDate ? dbsItem.rightToWork.verifiedDate.split('T')[0] : undefined,
            expiry: dbsItem.rightToWork.expiry ? dbsItem.rightToWork.expiry.split('T')[0] : undefined,
          } : {},
          overseas: dbsItem.overseas ? {
            ...dbsItem.overseas,
            checkDate: dbsItem.overseas.checkDate ? dbsItem.overseas.checkDate.split('T')[0] : undefined,
          } : {},
          childrenBarredListCheck: dbsItem.childrenBarredListCheck ? {
            ...dbsItem.childrenBarredListCheck,
            checkDate: dbsItem.childrenBarredListCheck.checkDate ? dbsItem.childrenBarredListCheck.checkDate.split('T')[0] : undefined,
          } : {},
          prohibitionFromTeaching: dbsItem.prohibitionFromTeaching ? {
            ...dbsItem.prohibitionFromTeaching,
            checkDate: dbsItem.prohibitionFromTeaching.checkDate ? dbsItem.prohibitionFromTeaching.checkDate.split('T')[0] : undefined,
          } : {},
          prohibitionFromManagement: dbsItem.prohibitionFromManagement ? {
            ...dbsItem.prohibitionFromManagement,
            checkDate: dbsItem.prohibitionFromManagement.checkDate ? dbsItem.prohibitionFromManagement.checkDate.split('T')[0] : undefined,
          } : {},
          disqualificationUnderChildrenAct: dbsItem.disqualificationUnderChildrenAct ? {
            ...dbsItem.disqualificationUnderChildrenAct,
            checkDate: dbsItem.disqualificationUnderChildrenAct.checkDate ? dbsItem.disqualificationUnderChildrenAct.checkDate.split('T')[0] : undefined,
          } : {},
          disqualifiedByAssociation: dbsItem.disqualifiedByAssociation ? {
            ...dbsItem.disqualifiedByAssociation,
            checkedDate: dbsItem.disqualifiedByAssociation.checkedDate ? dbsItem.disqualifiedByAssociation.checkedDate.split('T')[0] : undefined,
          } : {},
        })) : [],
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
    console.log('use effect 2')
    if (isEditMode && id) {
      fetchStaff();
      // Set staffId for edit mode
      setStaffId(id);
      staffIdRef.current = id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Fetch users for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await executeRequest('get', '/users?perPage=1000');
        setUsers(response || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to clean empty date strings recursively
  const cleanEmptyDateStrings = useCallback((obj: unknown): unknown => {
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
  }, []);

  // Track if staff has been created (for autosave in new mode) or use id in edit mode
  const [staffId, setStaffId] = useState<string | null>(id || null);
  const staffDataRef = useRef(staffData);
  const staffIdRef = useRef(staffId);

  // Keep refs in sync with state
  useEffect(() => {
    console.log('use effect 3')
    staffDataRef.current = staffData;
  }, [staffData]);

  useEffect(() => {
    console.log('use effect 4')
    staffIdRef.current = staffId;
  }, [staffId]);

  const handleSubmit = async (e?: React.FormEvent, isAutosave: boolean = false) => {
    if (e) {
    e.preventDefault();
    }

    // Use refs for autosave to get latest state, or state for manual save
    const currentData = isAutosave ? staffDataRef.current : staffData;
    const currentId = isAutosave ? staffIdRef.current : staffId;

    // Skip validation for autosave
    if (!isAutosave) {
    // Validate required fields
      if (!currentData.firstName || !currentData.email) {
      alert('Please fill in all required fields (First Name and Email)');
        return;
      }
    }

    // Skip autosave if required fields are missing
    if (isAutosave && (!currentData.firstName || !currentData.email)) {
      return;
    }

    // Clean data: convert empty date strings to undefined recursively
    const cleanedData = cleanEmptyDateStrings(currentData);

    try {
      if (currentId) {
        // Update existing staff (edit mode or autosave after initial creation)
        await executeRequest('patch', `/staff/${currentId}`, cleanedData);
      } else {
        // Create new staff
        const response = await executeRequest('post', '/staff', cleanedData);
        // Store the created staff ID for future autosaves
        if (response && response._id) {
          const newId = response._id;
          setStaffId(newId);
          staffIdRef.current = newId;
        }
      }

      // Only show alerts and navigate for manual saves
      if (!isAutosave) {
        alert(currentId ? 'Staff member updated successfully!' : 'Staff member created successfully!');
      navigate('/staff');
      }
    } catch (error: unknown) {
      // Only show errors for manual saves
      if (!isAutosave) {
      console.error('Error saving staff:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        : undefined;
      alert(errorMessage || 'Failed to save staff member. Please try again.');
      } else {
        // Silently log autosave errors
        console.error('Autosave error:', error);
      }
    }
  };

  // Autosave handler for blur events
  const handleAutosave = useCallback((e?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Don't autosave if user clicked on a button or link (relatedTarget)
    if (e?.relatedTarget) {
      const target = e.relatedTarget as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        return; // User clicked a button/link, don't autosave
      }
    }

    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      // Use refs to get latest state without dependencies
      const currentData = staffDataRef.current;
      const currentId = staffIdRef.current;

      // Skip if required fields are missing
      if (!currentData.firstName || !currentData.email) {
        return;
      }

      // Clean data: convert empty date strings to undefined recursively
      const cleanedData = cleanEmptyDateStrings(currentData);

      // Perform autosave - use API directly to avoid triggering loading state
      const method = currentId ? 'patch' : 'post';
      const url = currentId ? `/staff/${currentId}` : '/staff';
      
      api[method](url, cleanedData)
        .then((response) => {
          if (!currentId && response.data && response.data._id) {
            const newId = response.data._id;
            setStaffId(newId);
            staffIdRef.current = newId;
          }
        })
        .catch((error) => {
          // Silently log autosave errors
          console.error('Autosave error:', error);
        });
    }, 100); // Small delay to ensure state is updated
  }, [cleanEmptyDateStrings]);

  // Wrapper for textarea blur events
  const handleAutosaveTextarea = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Clear focus ref when textarea blurs so focus restoration doesn't interfere
    if (focusedInputRef.current && focusedInputRef.current.name === e.target.name) {
      focusedInputRef.current = null;
    }
    handleAutosave(e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>);
  }, [handleAutosave]);

  const handleCancel = () => {
    navigate('/staff');
  };

  // Tab content components - memoized to prevent focus loss
  const BasicInfoTabContent = useMemo(() => (
    <div className="tab-content">
      <div className="form-section">
        <div className="form-heading">
          <h2>Personal Information</h2>
        </div>
        <div className="form-row">
          <Input
            label="First Name *"
            name="firstName"
            value={staffData.firstName}
            onChange={handleFirstNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
            required
          />
          <Input
            label="Middle Name"
            name="middleName"
            value={staffData.middleName || ''}
            onChange={handleMiddleNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Last Name"
            name="lastName"
            value={staffData.lastName || ''}
            onChange={handleLastNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
        <div className="form-row">
          <Input
            label="Email *"
            name="email"
            type="email"
            value={staffData.email}
            onChange={handleEmailChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
            required
          />
          <Input
            label="Work Phone"
            name="phoneWork"
            value={staffData.phoneWork || ''}
            onChange={handlePhoneWorkChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Mobile Phone"
            name="phoneMobile"
            value={staffData.phoneMobile || ''}
            onChange={handlePhoneMobileChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Address Line 1"
            name="addressLine1"
            value={staffData.address?.line1 || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value } 
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
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
            onBlur={handleAutosave}
          />
          <Input
            label="City"
            name="city"
            value={staffData.address?.city || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, city: e.target.value } 
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Country"
            name="country"
            value={staffData.address?.country || 'United Kingdom'}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, country: e.target.value } 
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Postal Code"
            name="postalCode"
            value={staffData.address?.postalCode || ''}
            onChange={(e) => setStaffData((prev) => ({ 
              ...prev, 
              address: { ...prev.address, postalCode: e.target.value } 
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
        {/* <div className="form-row">
          
          <Input
            label="Preferred Name"
            name="preferredName"
            value={staffData.preferredName || ''}
            onChange={handlePreferredNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div> */}
      </div>

      {/* <div className="form-section"> */}
        {/* <div className="form-heading">
        <h2>Contact Information</h2>
        </div> */}
        
        
        {/* <div className="form-row">
          
        </div> */}
      {/* </div> */}

      <div className="form-section">
        <div className="form-heading">
        <h2>Employment Information</h2>
        </div>
        <div className="form-row">
          <Select
            label="Job Role"
            name="jobRole"
            value={staffData.jobRole || ''}
            onChange={handleJobRoleChange}
            options={[
              { value: 'teacher', label: 'Teacher' },
              { value: 'staff', label: 'Staff' }
            ]}
            placeholder="Select job role"
          />
          <Input
            label="Department"
            name="department"
            value={staffData.department || ''}
            onChange={handleDepartmentChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Select
            label="Work Location"
            name="workLocation"
            value={staffData.workLocation || ''}
            onChange={handleWorkLocationChange}
            options={[
              { value: 'Achieve Warrington', label: 'Achieve Warrington' },
              { value: 'Achieve Training', label: 'Achieve Training' }
            ]}
            placeholder="Select work location"
          />
        </div>
        <div className="form-row">
        </div>
        
        {/* <div className="form-row">
        </div> */}
        
        <div className="form-row">
          <DateInput
            label="Start Date"
            name="startDate"
            value={staffData.startDate || ''}
            onChange={handleStartDateChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
         
          <DateInput
            label="End Date"
            name="endDate"
            value={staffData.endDate || ''}
            onChange={handleEndDateChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
      </div>
    </div>
  ), [staffData, handleFirstNameChange, handleMiddleNameChange, handleLastNameChange, handleEmailChange, handlePhoneWorkChange, handlePhoneMobileChange, handleJobRoleChange, handleDepartmentChange, handleWorkLocationChange, handleStartDateChange, handleEndDateChange, saveFocus, handleAutosave]);

  const BasicInfoTab = () => BasicInfoTabContent;

  // const AddressTab = () => (
  //   <div className="tab-content">
  //     <div className="form-section">
  //       <div className="form-heading">
  //       <h2>Address Information</h2>
  //       </div>
  //       <div className="form-row">
  //         <Input
  //           label="Address Line 1"
  //           name="addressLine1"
  //           value={staffData.address?.line1 || ''}
  //           onChange={(e) => setStaffData((prev) => ({ 
  //             ...prev, 
  //             address: { ...prev.address, line1: e.target.value } 
  //           }))}
  //           onFocus={saveFocus}
  //           onBlur={handleAutosave}
  //         />
  //         <Input
  //           label="Address Line 2"
  //           name="addressLine2"
  //           value={staffData.address?.line2 || ''}
  //           onChange={(e) => setStaffData((prev) => ({ 
  //             ...prev, 
  //             address: { ...prev.address, line2: e.target.value } 
  //           }))}
  //           onFocus={saveFocus}
  //           onBlur={handleAutosave}
  //         />
  //       </div>
        
  //       <div className="form-row">
  //         <Input
  //           label="City"
  //           name="city"
  //           value={staffData.address?.city || ''}
  //           onChange={(e) => setStaffData((prev) => ({ 
  //             ...prev, 
  //             address: { ...prev.address, city: e.target.value } 
  //           }))}
  //           onFocus={saveFocus}
  //           onBlur={handleAutosave}
  //         />
  //         <Input
  //           label="Country"
  //           name="country"
  //           value={staffData.address?.country || 'United Kingdom'}
  //           onChange={(e) => setStaffData((prev) => ({ 
  //             ...prev, 
  //             address: { ...prev.address, country: e.target.value } 
  //           }))}
  //           onFocus={saveFocus}
  //           onBlur={handleAutosave}
  //         />
  //       </div>
        
  //       <div className="form-row">
  //         <Input
  //           label="Postal Code"
  //           name="postalCode"
  //           value={staffData.address?.postalCode || ''}
  //           onChange={(e) => setStaffData((prev) => ({ 
  //             ...prev, 
  //             address: { ...prev.address, postalCode: e.target.value } 
  //           }))}
  //           onFocus={saveFocus}
  //           onBlur={handleAutosave}
  //         />
          
  //       </div>
  //     </div>
  //   </div>
  // );

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
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
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
            <div className="form-heading">
              <h2>Emergency Contacts</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openAddContactPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Contact
              </button>
            </div>
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
              />
              <Select
                label="Relationship"
                name="contact-relationship"
                value={currentContact.relationship || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, relationship: e.target.value })}
                options={[
                  { value: 'father', label: 'Father' },
                  { value: 'mother', label: 'Mother' },
                  { value: 'guardian', label: 'Guardian' }
                ]}
                placeholder="Select relationship"
              />
              <Input
                label="Daytime Telephone"
                name="contact-daytime"
                value={currentContact.daytimeTelephone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, daytimeTelephone: e.target.value })}
              />
            </div>

            <div className="form-row">
              <Input
                label="Evening Telephone"
                name="contact-evening"
                value={currentContact.eveningTelephone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, eveningTelephone: e.target.value })}
              />
              <Input
                label="Mobile"
                name="contact-mobile"
                value={currentContact.mobile || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, mobile: e.target.value })}
              />
              <Input
                label="Email"
                name="contact-email"
                type="email"
                value={currentContact.email || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
              />
            </div>

            <div className="form-row">
              <Input
                label="Address"
                name="contact-address"
                value={currentContact.address || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, address: e.target.value })}
              />
            </div>
              <div>
              <TextField
                label="Notes"
                name="contact-notes"
                value={currentContact.notes || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, notes: e.target.value })}
                rows={4}
                textFieldWidth="97.7%"
              />
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  const DBSTab = () => {
    const dbsRecords = staffData.dbs || [];
    const [isDBSPopupOpen, setIsDBSPopupOpen] = useState(false);
    const [editingDBSIndex, setEditingDBSIndex] = useState<number | null>(null);
    const [currentDBS, setCurrentDBS] = useState<DBS>({
      staffMember: '',
      checkLevel: '',
      applicationSentDate: '',
      applicationReferenceNumber: '',
      certificateDateReceived: '',
      certificateNumber: '',
      dbsSeenBy: '',
      dbsCheckedDate: '',
      updateServiceId: '',
      updateServiceCheckDate: '',
      rightToWork: {},
      overseas: {},
      childrenBarredListCheck: {},
      prohibitionFromTeaching: {},
      prohibitionFromManagement: {},
      disqualificationUnderChildrenAct: {},
      disqualifiedByAssociation: {},
    });

    // Helper function to build full name from firstName, middleName, lastName
    const getFullName = () => {
      const parts = [
        staffData.firstName,
        staffData.middleName,
        staffData.lastName
      ].filter(Boolean);
      return parts.join(' ').trim();
    };

    const openAddDBSPopup = () => {
      setCurrentDBS({
        staffMember: getFullName(),
        checkLevel: '',
        applicationSentDate: '',
        applicationReferenceNumber: '',
        certificateDateReceived: '',
        certificateNumber: '',
        dbsSeenBy: '',
        dbsCheckedDate: '',
        updateServiceId: '',
        updateServiceCheckDate: '',
        rightToWork: {},
        overseas: {},
        childrenBarredListCheck: {},
        prohibitionFromTeaching: {},
        prohibitionFromManagement: {},
        disqualificationUnderChildrenAct: {},
        disqualifiedByAssociation: {},
      });
      setEditingDBSIndex(null);
      setIsDBSPopupOpen(true);
    };

    const openEditDBSPopup = (index: number) => {
      setCurrentDBS({ ...dbsRecords[index] });
      setEditingDBSIndex(index);
      setIsDBSPopupOpen(true);
    };

    const closeDBSPopup = () => {
      setIsDBSPopupOpen(false);
      setEditingDBSIndex(null);
      setCurrentDBS({
        staffMember: '',
        checkLevel: '',
        applicationSentDate: '',
        applicationReferenceNumber: '',
        certificateDateReceived: '',
        certificateNumber: '',
        dbsSeenBy: '',
        dbsCheckedDate: '',
        updateServiceId: '',
        updateServiceCheckDate: '',
        rightToWork: {},
        overseas: {},
        childrenBarredListCheck: {},
        prohibitionFromTeaching: {},
        prohibitionFromManagement: {},
        disqualificationUnderChildrenAct: {},
        disqualifiedByAssociation: {},
      });
    };

    const saveDBS = () => {
      const updatedDBS = [...dbsRecords];
      
      if (editingDBSIndex !== null) {
        // Update existing DBS
        updatedDBS[editingDBSIndex] = { ...currentDBS };
      } else {
        // Add new DBS
        updatedDBS.push({ ...currentDBS });
      }

      setStaffData({
        ...staffData,
        dbs: updatedDBS,
      });
      
      closeDBSPopup();
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
    };

    const removeDBS = (index: number) => {
      if (window.confirm('Are you sure you want to remove this DBS record?')) {
        setStaffData({
          ...staffData,
          dbs: dbsRecords.filter((_, i) => i !== index),
        });
        
        // Trigger autosave after removal
        setTimeout(() => {
          handleAutosave();
        }, 100);
      }
    };

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <div className="form-heading">
              <h2>DBS Records</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openAddDBSPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add DBS
              </button>
            </div>
          </div>

          {dbsRecords.length === 0 ? (
            <div className="empty-state">
              <p>No DBS records added. Click "Add DBS" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Check Level</th>
                    <th>Certificate Number</th>
                    <th>Certificate Date</th>
                    <th>DBS Checked Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dbsRecords.map((dbs, index) => (
                    <tr key={index}>
                      <td>{dbs.staffMember || 'N/A'}</td>
                      <td>{dbs.checkLevel || 'N/A'}</td>
                      <td>{dbs.certificateNumber || 'N/A'}</td>
                      <td>{dbs.certificateDateReceived ? (typeof dbs.certificateDateReceived === 'string' ? dbs.certificateDateReceived.split('T')[0] : dbs.certificateDateReceived) : 'N/A'}</td>
                      <td>{dbs.dbsCheckedDate ? (typeof dbs.dbsCheckedDate === 'string' ? dbs.dbsCheckedDate.split('T')[0] : dbs.dbsCheckedDate) : 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit-contact"
                            onClick={() => openEditDBSPopup(index)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => removeDBS(index)}
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
          isOpen={isDBSPopupOpen}
          onClose={closeDBSPopup}
          title={editingDBSIndex !== null ? 'Edit DBS' : 'Add DBS'}
          width="1200px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveDBS}
        >
          <div className="tab-content">
            {/* Basic DBS Information */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Basic DBS Information</h2>
              </div>
              <div className="form-row">
                <Input
                  label="Staff Member"
                  name="dbs-staff-member"
                  value={currentDBS.staffMember || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, staffMember: e.target.value })}
                />
                <Select
                  label="Check Level"
                  name="dbs-check-level"
                  value={currentDBS.checkLevel || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, checkLevel: e.target.value })}
                  options={[
                    { value: 'Standard', label: 'Standard' },
                    { value: 'Enhanced', label: 'Enhanced' },
                    { value: 'Enhanced with Barred List', label: 'Enhanced with Barred List' }
                  ]}
                  placeholder="Select check level"
                />
                <DateInput
                  label="Application Sent Date"
                  name="dbs-application-sent-date"
                  value={currentDBS.applicationSentDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, applicationSentDate: e.target.value })}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Application Reference Number"
                  name="dbs-application-ref-number"
                  value={currentDBS.applicationReferenceNumber || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, applicationReferenceNumber: e.target.value })}
                />
                <DateInput
                  label="Certificate Date Received"
                  name="dbs-certificate-date-received"
                  value={currentDBS.certificateDateReceived}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, certificateDateReceived: e.target.value })}
                />
                <Input
                  label="Certificate Number"
                  name="dbs-certificate-number"
                  value={currentDBS.certificateNumber || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, certificateNumber: e.target.value })}
                />
              </div>

              <div className="form-row">
                <Input
                  label="DBS Seen By"
                  name="dbs-seen-by"
                  value={currentDBS.dbsSeenBy || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, dbsSeenBy: e.target.value })}
                />
                <DateInput
                  label="DBS Checked Date"
                  name="dbs-checked-date"
                  value={currentDBS.dbsCheckedDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, dbsCheckedDate: e.target.value })}
                />
                <Input
                  label="Update Service ID"
                  name="dbs-update-service-id"
                  value={currentDBS.updateServiceId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, updateServiceId: e.target.value })}
                />
              </div>

              <div className="form-row">
                <DateInput
                  label="Update Service Check Date"
                  name="dbs-update-service-check-date"
                  value={currentDBS.updateServiceCheckDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, updateServiceCheckDate: e.target.value })}
                />
              </div>
            </div>

            {/* Right to Work */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Right to Work</h2>
              </div>
              <div className="form-row">
                <Select
                  label="Type"
                  name="right-to-work-type"
                  value={currentDBS.rightToWork?.type || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, rightToWork: { ...currentDBS.rightToWork, type: e.target.value } })}
                  options={[
                    { value: 'passport', label: 'Passport' },
                    { value: 'visa', label: 'Visa' },
                    { value: 'BRP', label: 'BRP' }
                  ]}
                  placeholder="Select type"
                />
                <DateInput
                  label="Verified Date"
                  name="right-to-work-verified-date"
                  value={currentDBS.rightToWork?.verifiedDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, rightToWork: { ...currentDBS.rightToWork, verifiedDate: e.target.value } })}
                />
                <DateInput
                  label="Expiry"
                  name="right-to-work-expiry"
                  value={currentDBS.rightToWork?.expiry}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, rightToWork: { ...currentDBS.rightToWork, expiry: e.target.value } })}
                />
              </div>

              <div className="form-row">
                <Select
                  label="Verified By"
                  name="right-to-work-verified-by"
                  value={currentDBS.rightToWork?.verifiedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, rightToWork: { ...currentDBS.rightToWork, verifiedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
                <Input
                  label="Evidence"
                  name="right-to-work-evidence"
                  value={currentDBS.rightToWork?.evidence || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, rightToWork: { ...currentDBS.rightToWork, evidence: e.target.value } })}
                />
              </div>
            </div>

            {/* Overseas Check */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Overseas Check</h2>
              </div>
              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.overseas?.checkNeeded || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, overseas: { ...currentDBS.overseas, checkNeeded: e.target.checked } })}
                    />
                    Check Needed
                  </label>
                </div>
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.overseas?.evidenceProduced || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, overseas: { ...currentDBS.overseas, evidenceProduced: e.target.checked } })}
                    />
                    Evidence Produced
                  </label>
                </div>
              </div>

              <div className="form-row">
                <DateInput
                  label="Check Date"
                  name="overseas-check-date"
                  value={currentDBS.overseas?.checkDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, overseas: { ...currentDBS.overseas, checkDate: e.target.value } })}
                />
                <Select
                  label="Check By"
                  name="overseas-checked-by"
                  value={currentDBS.overseas?.checkedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, overseas: { ...currentDBS.overseas, checkedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
                <Input
                  label="Upload Evidence"
                  name="overseas-upload-evidence"
                  value={currentDBS.overseas?.uploadEvidence || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, overseas: { ...currentDBS.overseas, uploadEvidence: e.target.value } })}
                />
              </div>
            </div>

            {/* Children Barred List Check */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Children Barred List Check</h2>
              </div>
              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.childrenBarredListCheck?.completed || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, childrenBarredListCheck: { ...currentDBS.childrenBarredListCheck, completed: e.target.checked } })}
                    />
                    Completed
                  </label>
                </div>
                <DateInput
                  label="Check Date"
                  name="children-barred-check-date"
                  value={currentDBS.childrenBarredListCheck?.checkDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, childrenBarredListCheck: { ...currentDBS.childrenBarredListCheck, checkDate: e.target.value } })}
                />
                <Select
                  label="Check By"
                  name="children-barred-checked-by"
                  value={currentDBS.childrenBarredListCheck?.checkedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, childrenBarredListCheck: { ...currentDBS.childrenBarredListCheck, checkedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
              </div>
            </div>

            {/* Prohibition from Teaching */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Prohibition from Teaching</h2>
              </div>
              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.prohibitionFromTeaching?.checked || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromTeaching: { ...currentDBS.prohibitionFromTeaching, checked: e.target.checked } })}
                    />
                    Checked
                  </label>
                </div>
                <DateInput
                  label="Check Date"
                  name="prohibition-teaching-check-date"
                  value={currentDBS.prohibitionFromTeaching?.checkDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromTeaching: { ...currentDBS.prohibitionFromTeaching, checkDate: e.target.value } })}
                />
                <Select
                  label="Checked By"
                  name="prohibition-teaching-checked-by"
                  value={currentDBS.prohibitionFromTeaching?.checkedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromTeaching: { ...currentDBS.prohibitionFromTeaching, checkedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
              </div>
            </div>

            {/* Prohibition from Management */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Prohibition from Management</h2>
              </div>
              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.prohibitionFromManagement?.completed || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromManagement: { ...currentDBS.prohibitionFromManagement, completed: e.target.checked } })}
                    />
                    Completed
                  </label>
                </div>
                <DateInput
                  label="Check Date"
                  name="prohibition-management-check-date"
                  value={currentDBS.prohibitionFromManagement?.checkDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromManagement: { ...currentDBS.prohibitionFromManagement, checkDate: e.target.value } })}
                />
                <Select
                  label="Checked By"
                  name="prohibition-management-checked-by"
                  value={currentDBS.prohibitionFromManagement?.checkedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromManagement: { ...currentDBS.prohibitionFromManagement, checkedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
              </div>

              <div>
                <TextField
                  label="Notes"
                  name="prohibition-management-notes"
                  value={currentDBS.prohibitionFromManagement?.notes || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, prohibitionFromManagement: { ...currentDBS.prohibitionFromManagement, notes: e.target.value } })}
                  rows={3}
                  textFieldWidth="97.7%"
                />
              </div>
            </div>

            {/* Disqualification under Children Act */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Disqualification under Children Act</h2>
              </div>
              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.disqualificationUnderChildrenAct?.completed || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, disqualificationUnderChildrenAct: { ...currentDBS.disqualificationUnderChildrenAct, completed: e.target.checked } })}
                    />
                    Completed
                  </label>
                </div>
                <DateInput
                  label="Check Date"
                  name="disqualification-children-act-check-date"
                  value={currentDBS.disqualificationUnderChildrenAct?.checkDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, disqualificationUnderChildrenAct: { ...currentDBS.disqualificationUnderChildrenAct, checkDate: e.target.value } })}
                />
                <Select
                  label="Checked By"
                  name="disqualification-children-act-checked-by"
                  value={currentDBS.disqualificationUnderChildrenAct?.checkedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, disqualificationUnderChildrenAct: { ...currentDBS.disqualificationUnderChildrenAct, checkedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
              </div>
            </div>

            {/* Disqualified by Association */}
            <div className="form-section">
              <div className="form-heading">
                <h2>Disqualified by Association</h2>
              </div>
              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentDBS.disqualifiedByAssociation?.completed || false}
                      onChange={(e) => setCurrentDBS({ ...currentDBS, disqualifiedByAssociation: { ...currentDBS.disqualifiedByAssociation, completed: e.target.checked } })}
                    />
                    Completed
                  </label>
                </div>
                <DateInput
                  label="Checked Date"
                  name="disqualified-association-checked-date"
                  value={currentDBS.disqualifiedByAssociation?.checkedDate}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, disqualifiedByAssociation: { ...currentDBS.disqualifiedByAssociation, checkedDate: e.target.value } })}
                />
                <Select
                  label="Checked By"
                  name="disqualified-association-checked-by"
                  value={currentDBS.disqualifiedByAssociation?.checkedByUserId || ''}
                  onChange={(e) => setCurrentDBS({ ...currentDBS, disqualifiedByAssociation: { ...currentDBS.disqualifiedByAssociation, checkedByUserId: e.target.value } })}
                  options={users.map(user => ({
                    value: user._id,
                    label: user.name
                  }))}
                  placeholder="Select user"
                />
              </div>
            </div>
          </div>
        </Popup>
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
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
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
            <div className="form-heading">
              <h2>CPD Training</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openAddTrainingPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Training
              </button>
            </div>
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
          title={editingTrainingIndex !== null ? 'Edit Training' : 'Add Training'}
          width="800px"
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
                required
              />
              <Select
                label="Status"
                name="training-status"
                value={currentTraining.status || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentTraining({ ...currentTraining, status: e.target.value })}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Expired', label: 'Expired' },
                ]}
                placeholder="Select Status"
              />
              <div className="file-input-field">
                <label htmlFor="training-upload-certificate" className="file-input-label">Upload Certificate</label>
                <input
                  id="training-upload-certificate"
                  type="file"
                  name="training-upload-certificate"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
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
              <DateInput
                label="Date Completed"
                name="training-date-completed"
                value={currentTraining.dateCompleted}
                onChange={(e) => setCurrentTraining({ ...currentTraining, dateCompleted: e.target.value })}
              />
              <DateInput
                label="Expiry Date"
                name="training-expiry-date"
                value={currentTraining.expiryDate}
                onChange={(e) => setCurrentTraining({ ...currentTraining, expiryDate: e.target.value })}
              />
            </div>

            <div className="form-row">
              
            </div>

            <div>
              <TextField
                label="Notes"
                name="training-notes"
                value={currentTraining.notes || ''}
                onChange={(e) => setCurrentTraining({ ...currentTraining, notes: e.target.value })}
                rows={4}
                textFieldWidth="97.7%"
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
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
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
            <div className="form-heading">
            <h2>Qualifications</h2>
            <button
              type="button"
              className="btn-add"
              onClick={openAddQualificationPopup}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Qualification
            </button>
            </div>
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
                required
              />
              <Input
                label="Qualification Type"
                name="qualification-type"
                value={currentQualification.qualificationType || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, qualificationType: e.target.value })}
              />
              <Input
                label="Class of Degree"
                name="qualification-class-degree"
                value={currentQualification.classOfDegree || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, classOfDegree: e.target.value })}
              />
            </div>

            <div className="form-row">
              <Input
                label="QT Status"
                name="qualification-qt-status"
                value={currentQualification.qtStatus || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, qtStatus: e.target.value })}
              />
              <Input
                label="NQT/ECT Status"
                name="qualification-nqt-ect-status"
                value={currentQualification.nqtEctStatus || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, nqtEctStatus: e.target.value })}
              />
              <Input
                label="Subject 1"
                name="qualification-subject1"
                value={currentQualification.subject1 || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, subject1: e.target.value })}
              />
            </div>

            <div className="form-row">
            </div>

            <div className="form-row">
              <Input
                label="Subject 2"
                name="qualification-subject2"
                value={currentQualification.subject2 || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, subject2: e.target.value })}
              />
              <DateInput
                label="Achieved Date"
                name="qualification-achieved-date"
                value={currentQualification.achievedDate}
                onChange={(e) => setCurrentQualification({ ...currentQualification, achievedDate: e.target.value })}
              />
              <DateInput
                label="Expiry Date"
                name="qualification-expiry-date"
                value={currentQualification.expiryDate}
                onChange={(e) => setCurrentQualification({ ...currentQualification, expiryDate: e.target.value })}
              />
            </div>

            <div className="form-row">
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
            </div>

            <div>
              <TextField
                label="Notes"
                name="qualification-notes"
                value={currentQualification.notes || ''}
                onChange={(e) => setCurrentQualification({ ...currentQualification, notes: e.target.value })}
                rows={4}
                textFieldWidth='97.7%'
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
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
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
            <div className="form-heading">
              <h2>HR Records</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openAddHRPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add HR Record
              </button>
            </div>
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
              />
              <DateInput
                label="Absence Date"
                name="hr-absence-date"
                value={currentHR.absenceDate}
                onChange={(e) => setCurrentHR({ ...currentHR, absenceDate: e.target.value })}
              />
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

            <div>
              <TextField
                label="Reason"
                name="hr-reason"
                value={currentHR.reason || ''}
                onChange={(e) => setCurrentHR({ ...currentHR, reason: e.target.value })}
                rows={4}
                textFieldWidth='97.7%'
              />
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
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
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
          <div className="form-heading">
          <h2>Medical Needs</h2>
          </div>

          <div className="form-row">
            <TextField
              label="Medical Description"
              name="medical-description"
              value={medicalNeeds.medicalDescription || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, medicalDescription: e.target.value },
              })}
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
              rows={4}
            />
            <TextField
              label="Conditions / Syndrome"
              name="conditions-syndrome"
              value={medicalNeeds.conditionsSyndrome || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, conditionsSyndrome: e.target.value },
              })}
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
              rows={4}
            />
              <TextField
                label="Medication"
                name="medication"
                value={medicalNeeds.medication || ''}
                onChange={(e) => setStaffData({
                  ...staffData,
                  medicalNeeds: { ...medicalNeeds, medication: e.target.value },
                })}
                onFocus={saveFocusTextarea}
                onBlur={handleAutosaveTextarea}
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
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
              rows={3}
            />
            <TextField
              label="Impairments"
              name="impairments"
              value={medicalNeeds.impairments || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, impairments: e.target.value },
              })}
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
              rows={3}
            />
            <TextField
              label="Allergies"
              name="allergies"
              value={medicalNeeds.allergies || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, allergies: e.target.value },
              })}
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
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
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
              rows={3}
            />
            <TextField
              label="Medical Notes"
              name="medical-notes"
              value={medicalNeeds.medicalNotes || ''}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, medicalNotes: e.target.value },
              })}
              onFocus={saveFocusTextarea}
              onBlur={handleAutosaveTextarea}
              rows={4}
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
            onBlur={handleAutosave}
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
            onBlur={handleAutosave}
            />
            <DateInput
              label="Last Medical Check"
              name="last-medical-check"
              value={medicalNeeds.lastMedicalCheck}
              onChange={(e) => setStaffData({
                ...staffData,
                medicalNeeds: { ...medicalNeeds, lastMedicalCheck: e.target.value },
              })}
              onFocus={saveFocus}
              onBlur={handleAutosave}
            />
          </div>

          <div className="form-section" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <div className="form-heading">
              <h2>Doctor Contact Details</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openAddDoctorPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Doctor Contact
              </button>
              </div>
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
                />
                <Input
                  label="Relationship"
                  name="doctor-relationship"
                  value={currentDoctor.relationship || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, relationship: e.target.value })}
                />
                <Input
                  label="Mobile"
                  name="doctor-mobile"
                  value={currentDoctor.mobile || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, mobile: e.target.value })}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Daytime Phone"
                  name="doctor-daytime-phone"
                  value={currentDoctor.daytimePhone || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, daytimePhone: e.target.value })}
                />
                <Input
                  label="Evening Phone"
                  name="doctor-evening-phone"
                  value={currentDoctor.eveningPhone || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, eveningPhone: e.target.value })}
                />
                <Input
                  label="Email"
                  name="doctor-email"
                  type="email"
                  value={currentDoctor.email || ''}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
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
    // { id: 'address', label: 'Address', content: <AddressTab /> },
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
          <h1>{isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="new-staff-form">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' :'Save'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
            
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditStaff;