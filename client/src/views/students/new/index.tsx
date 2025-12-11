import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/layout';
import Input from '../../../components/input/Input';
import Select from '../../../components/Select/Select';
import { Tabs } from '../../../components/Tabs/Tabs';
import { useApiRequest } from '../../../hooks/useApiRequest';
import './index.scss';
import DateInput from '../../../components/dateInput/DateInput';
interface StudentData {
  personalInfo: {
    legalFirstName: string;
    middleName?: string;
    lastName: string;
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
}

const NewStudent = () => {
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

  const [studentData, setStudentData] = useState<StudentData>({
    personalInfo: {
      legalFirstName: '',
      lastName: '',
    },
    parents: [],
    emergencyContacts: [],
  });

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

  // Track if student has been created (for autosave)
  const [studentId, setStudentId] = useState<string | null>(null);
  const studentDataRef = useRef(studentData);
  const studentIdRef = useRef(studentId);

  // Keep refs in sync with state
  useEffect(() => {
    studentDataRef.current = studentData;
  }, [studentData]);

  useEffect(() => {
    studentIdRef.current = studentId;
  }, [studentId]);

  const handleSubmit = async (e?: React.FormEvent, isAutosave: boolean = false) => {
    if (e) {
      e.preventDefault();
    }

    // Use refs for autosave to get latest state, or state for manual save
    const currentData = isAutosave ? studentDataRef.current : studentData;
    const currentId = isAutosave ? studentIdRef.current : studentId;

    // Skip validation for autosave
    if (!isAutosave) {
      // Validate required fields
      if (!currentData.personalInfo.legalFirstName || !currentData.personalInfo.lastName) {
        alert('Please fill in all required fields (Legal First Name and Last Name)');
        return;
      }
    }

    // Skip autosave if required fields are missing
    if (isAutosave && (!currentData.personalInfo.legalFirstName || !currentData.personalInfo.lastName)) {
      return;
    }

    // Clean data: convert empty date strings to undefined recursively
    const cleanedData = cleanEmptyDateStrings(currentData);

    try {
      if (currentId) {
        // Update existing student (autosave after initial creation)
        await executeRequest('patch', `/students/${currentId}`, cleanedData);
      } else {
        // Create new student
        const response = await executeRequest('post', '/students', cleanedData);
        // Store the created student ID for future autosaves
        if (response && response._id) {
          const newId = response._id;
          setStudentId(newId);
          studentIdRef.current = newId;
        }
      }

      // Only show alerts and navigate for manual saves
      if (!isAutosave) {
        alert(currentId ? 'Student updated successfully!' : 'Student created successfully!');
        navigate('/students');
      }
    } catch (error: unknown) {
      // Only show errors for manual saves
      if (!isAutosave) {
        console.error('Error saving student:', error);
        const errorMessage = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
          : undefined;
        alert(errorMessage || 'Failed to save student. Please try again.');
      } else {
        // Silently log autosave errors
        console.error('Autosave error:', error);
      }
    }
  };

  // Autosave handler for blur events
  const handleAutosave = useCallback((e?: React.FocusEvent<HTMLInputElement>) => {
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
      const currentData = studentDataRef.current;
      const currentId = studentIdRef.current;

      // Skip if required fields are missing
      if (!currentData.personalInfo.legalFirstName || !currentData.personalInfo.lastName) {
        return;
      }

      // Clean data
      const cleanedData = cleanEmptyDateStrings(currentData);

      // Perform autosave
      if (currentId) {
        // Update existing student
        executeRequest('patch', `/students/${currentId}`, cleanedData)
          .then((response) => {
            console.log('Autosave successful:', response);
          })
          .catch((error) => {
            // Silently log autosave errors
            console.error('Autosave error:', error);
          });
      } else {
        // Create new student
        executeRequest('post', '/students', cleanedData)
          .then((response) => {
            if (!currentId && response && response._id) {
              const newId = response._id;
              setStudentId(newId);
              studentIdRef.current = newId;
            }
          })
          .catch((error) => {
            // Silently log autosave errors
            console.error('Autosave error:', error);
          });
      }
    }, 100); // Small delay to ensure state is updated
  }, [executeRequest, cleanEmptyDateStrings]);

  const handleCancel = () => {
    navigate('/students');
  };

  // Create stable onChange handlers for personalInfo fields
  const handleLegalFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, legalFirstName: e.target.value }
    }));
  }, []);

  const handleMiddleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, middleName: e.target.value }
    }));
  }, []);

  const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, lastName: e.target.value }
    }));
  }, []);

  const handlePreferredNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, preferredName: e.target.value }
    }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, email: e.target.value }
    }));
  }, []);

  const handleMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, mobile: e.target.value }
    }));
  }, []);

  // Tab content components - memoized to prevent focus loss
  const BasicInfoTabContent = useMemo(() => (
    <div className="tab-content">
      <div className="form-section">
        <div className="form-heading">
          <h2>Personal Information</h2>
        </div>
        <div className="form-row">
          <Input
            label="Legal First Name *"
            name="legalFirstName"
            value={studentData.personalInfo.legalFirstName}
            onChange={handleLegalFirstNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
            required
          />
          <Input
            label="Middle Name"
            name="middleName"
            value={studentData.personalInfo.middleName || ''}
            onChange={handleMiddleNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Last Name *"
            name="lastName"
            value={studentData.personalInfo.lastName}
            onChange={handleLastNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
            required
          />
          <Input
            label="Preferred Name"
            name="preferredName"
            value={studentData.personalInfo.preferredName || ''}
            onChange={handlePreferredNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>

        <div className="form-row">
          <Input
            label="ADNO"
            name="adno"
            value={studentData.personalInfo.adno || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, adno: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="UPN"
            name="upn"
            value={studentData.personalInfo.upn || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, upn: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>

        <div className="form-row">
          <Select
            label="Sex"
            name="sex"
            value={studentData.personalInfo.sex || ''}
            onChange={(e) => {
              setStudentData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, sex: e.target.value as 'Male' | 'Female' | 'Unknown' }
              }));
              // Trigger autosave on change for Select component
              setTimeout(() => {
                handleAutosave();
              }, 100);
            }}
            options={[
              { value: '', label: 'Select...' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Unknown', label: 'Unknown' },
            ]}
          />
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            value={studentData.personalInfo.dateOfBirth || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-heading">
          <h2>Contact Information</h2>
        </div>
        <div className="form-row">
          <Input
            label="Email"
            name="email"
            type="email"
            value={studentData.personalInfo.email || ''}
            onChange={handleEmailChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Mobile"
            name="mobile"
            value={studentData.personalInfo.mobile || ''}
            onChange={handleMobileChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-heading">
          <h2>Admission Information</h2>
        </div>
        <div className="form-row">
          <DateInput
            label="Admission Date"
            name="admissionDate"
            value={studentData.personalInfo.admissionDate || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, admissionDate: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Year Group"
            name="yearGroup"
            value={studentData.personalInfo.yearGroup || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, yearGroup: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Ethnicity"
            name="ethnicity"
            value={studentData.personalInfo.ethnicity || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, ethnicity: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
          <Input
            label="Photo URL"
            name="photo"
            value={studentData.personalInfo.photo || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, photo: e.target.value }
            }))}
            onFocus={saveFocus}
            onBlur={handleAutosave}
          />
        </div>
      </div>
    </div>
  ), [studentData, handleLegalFirstNameChange, handleMiddleNameChange, handleLastNameChange, handlePreferredNameChange, handleEmailChange, handleMobileChange, saveFocus, handleAutosave]);

  const BasicInfoTab = () => BasicInfoTabContent;

  // Parents Tab - simplified for now, can be expanded
  const ParentsTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="form-heading">
          <h2>Parents/Guardians</h2>
        </div>
        <div className="empty-state">
          <p>Parent management will be implemented here</p>
        </div>
      </div>
    </div>
  );

  // Emergency Contacts Tab
  const EmergencyContactsTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="form-heading">
          <h2>Emergency Contacts</h2>
        </div>
        <div className="empty-state">
          <p>Emergency contact management will be implemented here</p>
        </div>
      </div>
    </div>
  );

  // Medical Tab
  const MedicalTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="form-heading">
          <h2>Medical Information</h2>
        </div>
        <div className="empty-state">
          <p>Medical information management will be implemented here</p>
        </div>
      </div>
    </div>
  );

  // Behaviour Tab
  const BehaviourTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="form-heading">
          <h2>Behaviour Information</h2>
        </div>
        <div className="empty-state">
          <p>Behaviour information management will be implemented here</p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Information', content: <BasicInfoTab /> },
    { id: 'parents', label: 'Parents', content: <ParentsTab /> },
    { id: 'emergency', label: 'Emergency Contacts', content: <EmergencyContactsTab /> },
    { id: 'medical', label: 'Medical', content: <MedicalTab /> },
    { id: 'behaviour', label: 'Behaviour', content: <BehaviourTab /> },
  ];

  return (
    <Layout>
      <div className="new-staff">
        <div className="new-staff-header">
          <h1>Add New Student</h1>
        </div>
        
        <form onSubmit={(e) => handleSubmit(e, false)} className="new-staff-form">
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewStudent;

