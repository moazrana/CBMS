import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faArrowRight, faArrowLeft, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../../layouts/layout';
import Input from '../../../components/input/Input';
import Select from '../../../components/Select/Select';
import TextField from '../../../components/textField/TextField';
import Popup from '../../../components/Popup/Popup';
import { Tabs } from '../../../components/Tabs/Tabs';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import './index.scss';
import DateInput from '../../../components/dateInput/DateInput';
import TimeTableComponent from '../../../components/timeTable/timeTable';
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
    location?: string;
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

const EditStudent = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { executeRequest, loading } = useApiRequest();
  const [activeTab, setActiveTab] = useState('basic');
  const isEditMode = !!id;
  
  // Ref to track focused input
  const focusedInputRef = useRef<{ name: string; selectionStart: number | null } | null>(null);
  
  // Save focus state before render
  const saveFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    // Don't save focus for date inputs - they don't support selection and can interfere with navigation
    if (input.type === 'date') {
      focusedInputRef.current = null;
      return;
    }
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
        // Skip if element is a date input - they don't support selection and shouldn't be restored
        if (input.type === 'date') {
          focusedInputRef.current = null;
          return;
        }
        input.focus();
        // Input types that support setSelectionRange (email is included but won't use setSelectionRange)
        const selectionSupportedTypes = ['text', 'search', 'url', 'tel', 'password', 'email'];
        // Only try setSelectionRange for types that actually support it (not email)
        if (focusedInputRef.current.selectionStart !== null && 
            selectionSupportedTypes.includes(input.type) && 
            input.type !== 'email') {
          try {
            input.setSelectionRange(focusedInputRef.current.selectionStart, focusedInputRef.current.selectionStart);
          } catch {
            // Ignore errors for input types that don't support selection
          }
        }
        // For email inputs, we just focus them without trying to set selection range
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

  // Track student ID (set after creation or in edit mode)
  const studentIdRef = useRef<string | null>(id || null);
  const studentDataRef = useRef(studentData);

  // Keep refs in sync with state
  useEffect(() => {
    studentDataRef.current = studentData;
  }, [studentData]);

  // Keep studentIdRef in sync with id param
  useEffect(() => {
    if (id) {
      studentIdRef.current = id;
    }
  }, [id]);

  // Track if data has been fetched
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch student data (only in edit mode)
  useEffect(() => {
    if (!id || hasFetched || !isEditMode) return;
    
    const fetchStudent = async () => {
      try {
        const response = await executeRequest('get', `/students/${id}`);
        const personalInfo = response.personalInfo || {};
        
        // Format dates for input fields
        const formatDate = (date: string | Date | undefined): string => {
          if (!date) return '';
          const d = new Date(date);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().split('T')[0];
        };

        setStudentData({
          personalInfo: {
            legalFirstName: personalInfo.legalFirstName || '',
            middleName: personalInfo.middleName || '',
            lastName: personalInfo.lastName || '',
            preferredName: personalInfo.preferredName || '',
            adno: personalInfo.adno || '',
            upn: personalInfo.upn || '',
            sex: personalInfo.sex,
            dateOfBirth: formatDate(personalInfo.dateOfBirth),
            email: personalInfo.email || '',
            mobile: personalInfo.mobile || '',
            admissionDate: formatDate(personalInfo.admissionDate),
            yearGroup: personalInfo.yearGroup || '',
            ethnicity: personalInfo.ethnicity || '',
            photo: personalInfo.photo || '',
            location: personalInfo.location || '',
            notesAndFiles: personalInfo.notesAndFiles || [],
          },
          parents: response.parents || [],
          emergencyContacts: response.emergencyContacts || [],
          medical: response.medical || undefined,
          behaviour: response.behaviour || undefined,
        });
        setHasFetched(true);
      } catch (error) {
        console.error('Error fetching student:', error);
        alert('Failed to load student data. Please try again.');
        navigate('/students');
      }
    };

    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const handleSubmit = async (e?: React.FormEvent, isAutosave: boolean = false) => {
    if (e) {
      e.preventDefault();
    }

    // Use refs for autosave to get latest state, or state for manual save
    const currentData = isAutosave ? studentDataRef.current : studentData;
    const currentId = id || studentIdRef.current;

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
      let response;
      if (currentId) {
        // Update existing student
        response = await executeRequest('patch', `/students/${currentId}`, cleanedData);
      } else {
        // Create new student
        response = await executeRequest('post', '/students', cleanedData);
        if (response.data && response.data._id) {
          const newId = response.data._id;
          studentIdRef.current = newId;
          // Update URL without navigation
          window.history.replaceState({}, '', `/students/edit/${newId}`);
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
  const handleAutosave = useCallback((e?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        console.log('Autosave skipped: missing required fields');
        return;
      }

      // Clean data
      const cleanedData = cleanEmptyDateStrings(currentData);

      // Perform autosave - use POST for new students, PATCH for existing ones
      const method = currentId ? 'patch' : 'post';
      const url = currentId ? `/students/${currentId}` : '/students';
      
      api[method](url, cleanedData)
        .then((response) => {
          if (!currentId && response.data && response.data._id) {
            const newId = response.data._id;
            studentIdRef.current = newId;
            // Update URL without navigation
            window.history.replaceState({}, '', `/students/edit/${newId}`);
          }
          console.log('Autosave successful:', response.data);
        })
        .catch((error) => {
          // Silently log autosave errors
          console.error('Autosave error:', error);
        });
    }, 100); // Small delay to ensure state is updated
  }, [cleanEmptyDateStrings]);

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
          <Input
            label="Last Name *"
            name="lastName"
            value={studentData.personalInfo.lastName}
            onChange={handleLastNameChange}
            onFocus={saveFocus}
            onBlur={handleAutosave}
            required
          />
        </div>
        
        <div className="form-row">
          
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
          <Select
            label="Sex"
            name="sex"
            value={studentData.personalInfo.sex || ''}
            onChange={(e) => {
              setStudentData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, sex: e.target.value as 'Male' | 'Female' | 'Unknown' }
              }));
              // Trigger autosave after a delay
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
        </div>

        <div className="form-row">
          <DateInput
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

      {/* <div className="form-section">
        <div className="form-heading">
          <h2>Contact Information</h2>
        </div>
        <div className="form-row">
        </div>
      </div> */}

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
          <Select
            label="Year Group"
            name="yearGroup"
            value={studentData.personalInfo.yearGroup || ''}
            onChange={(e) => setStudentData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, yearGroup: e.target.value }
            }))}
            onBlur={handleAutosave}
            options={[
              { value: 'Reception', label: 'Reception' },
              { value: 'Year 1', label: 'Year 1' },
              { value: 'Year 2', label: 'Year 2' },
              { value: 'Year 3', label: 'Year 3' },
              { value: 'Year 4', label: 'Year 4' },
              { value: 'Year 5', label: 'Year 5' },
              { value: 'Year 6', label: 'Year 6' },
              { value: 'Year 7', label: 'Year 7' },
              { value: 'Year 8', label: 'Year 8' },
              { value: 'Year 9', label: 'Year 9' },
              { value: 'Year 10', label: 'Year 10' },
              { value: 'Year 11', label: 'Year 11' },
              { value: 'Year 12', label: 'Year 12' },
              { value: 'Year 13', label: 'Year 13' },
            ]}
            placeholder="Select Year Group"
          />
          <Select
            label="Location"
            name="location"
            value={studentData.personalInfo.location || ''}
            onChange={(e) => {
              setStudentData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, location: e.target.value }
              }));
              // Trigger autosave after a delay
              setTimeout(() => {
                handleAutosave();
              }, 100);
            }}
            onBlur={handleAutosave}
            options={[
              { value: '', label: 'Select...' },
              { value: 'Warrington', label: 'Warrington' },
              { value: 'Burrow', label: 'Burrow' },
            ]}
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
  ), [studentData, handleLegalFirstNameChange, handleMiddleNameChange, handleLastNameChange, handleEmailChange, handleMobileChange, saveFocus, handleAutosave]);

  const BasicInfoTab = () => BasicInfoTabContent;

  // Parents Tab
  const ParentsTab = () => {
    const parents = studentData.parents || [];
    const [isParentPopupOpen, setIsParentPopupOpen] = useState(false);
    const [editingParentIndex, setEditingParentIndex] = useState<number | null>(null);
    type ParentType = NonNullable<StudentData['parents']>[0];
    const [currentParent, setCurrentParent] = useState<ParentType>({
      salutation: '',
      firstName: '',
      middleName: '',
      lastName: '',
      relationship: '',
      priority: 'Primary',
      sex: 'Unknown',
      email: '',
      homePhone: '',
      mobile: '',
      workPhone: '',
      alternateHomeNo: '',
      parentalResponsibility: false,
      doNotContact: false,
      parentLivesWithStudent: false,
      estrangedParent: false,
      copyInLetters: false,
      address: {},
      notes: '',
    });

    const openAddParentPopup = () => {
      setCurrentParent({
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        relationship: '',
        priority: 'Primary',
        sex: 'Unknown',
        email: '',
        homePhone: '',
        mobile: '',
        workPhone: '',
        alternateHomeNo: '',
        parentalResponsibility: false,
        doNotContact: false,
        parentLivesWithStudent: false,
        estrangedParent: false,
        copyInLetters: false,
        address: {},
        notes: '',
      });
      setEditingParentIndex(null);
      setIsParentPopupOpen(true);
    };

    const openEditParentPopup = (index: number) => {
      setCurrentParent({ ...parents[index] });
      setEditingParentIndex(index);
      setIsParentPopupOpen(true);
    };

    const closeParentPopup = () => {
      setIsParentPopupOpen(false);
      setEditingParentIndex(null);
      setCurrentParent({
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        relationship: '',
        priority: 'Primary',
        sex: 'Unknown',
        email: '',
        homePhone: '',
        mobile: '',
        workPhone: '',
        alternateHomeNo: '',
        parentalResponsibility: false,
        doNotContact: false,
        parentLivesWithStudent: false,
        estrangedParent: false,
        copyInLetters: false,
        address: {},
        notes: '',
      });
    };

    const saveParent = () => {
      const updatedParents = [...parents];
      
      if (editingParentIndex !== null) {
        // Update existing parent
        updatedParents[editingParentIndex] = { ...currentParent };
      } else {
        // Add new parent
        updatedParents.push({ ...currentParent });
      }

      setStudentData({
        ...studentData,
        parents: updatedParents,
      });
      
      closeParentPopup();
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
    };

    const removeParent = (index: number) => {
      if (window.confirm('Are you sure you want to remove this parent?')) {
        setStudentData({
          ...studentData,
          parents: parents.filter((_, i) => i !== index),
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
              <h2>Parents/Guardians</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openAddParentPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Parent
              </button>
            </div>
          </div>

          {parents.length === 0 ? (
            <div className="empty-state">
              <p>No parents added. Click "Add Parent" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Relationship</th>
                    <th>Priority</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Home Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent, index) => (
                    <tr key={index}>
                      <td>{[parent.salutation, parent.firstName, parent.middleName, parent.lastName].filter(Boolean).join(' ') || 'N/A'}</td>
                      <td>{parent.relationship || 'N/A'}</td>
                      <td>{parent.priority || 'N/A'}</td>
                      <td>{parent.email || 'N/A'}</td>
                      <td>{parent.mobile || 'N/A'}</td>
                      <td>{parent.homePhone || 'N/A'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit-contact"
                            onClick={() => openEditParentPopup(index)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => removeParent(index)}
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
          isOpen={isParentPopupOpen}
          onClose={closeParentPopup}
          title={editingParentIndex !== null ? 'Edit Parent' : 'Add Parent'}
          width="1200px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveParent}
        >
          <form className="contact-popup-form">
            <div className="form-row">
              <Input
                label="Salutation"
                name="parent-salutation"
                value={currentParent.salutation || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, salutation: e.target.value })}
              />
              <Input
                label="First Name"
                name="parent-first-name"
                value={currentParent.firstName || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, firstName: e.target.value })}
              />
              <Input
                label="Middle Name"
                name="parent-middle-name"
                value={currentParent.middleName || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, middleName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <Input
                label="Last Name"
                name="parent-last-name"
                value={currentParent.lastName || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, lastName: e.target.value })}
              />
              <Input
                label="Relationship"
                name="parent-relationship"
                value={currentParent.relationship || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, relationship: e.target.value })}
              />
              <Select
                label="Priority"
                name="parent-priority"
                value={currentParent.priority || 'Primary'}
                onChange={(e) => setCurrentParent({ ...currentParent, priority: e.target.value as 'Primary' | 'Secondary' | 'Emergency' })}
                options={[
                  { value: 'Primary', label: 'Primary' },
                  { value: 'Secondary', label: 'Secondary' },
                  { value: 'Emergency', label: 'Emergency' },
                ]}
              />
            </div>

            <div className="form-row">
              <Select
                label="Sex"
                name="parent-sex"
                value={currentParent.sex || 'Unknown'}
                onChange={(e) => setCurrentParent({ ...currentParent, sex: e.target.value as 'Male' | 'Female' | 'Unknown' })}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Unknown', label: 'Unknown' },
                ]}
              />
              <Input
                label="Email"
                name="parent-email"
                type="email"
                value={currentParent.email || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, email: e.target.value })}
              />
              <Input
                label="Home Phone"
                name="parent-home-phone"
                value={currentParent.homePhone || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, homePhone: e.target.value })}
              />
            </div>

            <div className="form-row">
              <Input
                label="Mobile"
                name="parent-mobile"
                value={currentParent.mobile || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, mobile: e.target.value })}
              />
              <Input
                label="Work Phone"
                name="parent-work-phone"
                value={currentParent.workPhone || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, workPhone: e.target.value })}
              />
              <Input
                label="Alternate Home No"
                name="parent-alternate-home"
                value={currentParent.alternateHomeNo || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, alternateHomeNo: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentParent.parentalResponsibility || false}
                    onChange={(e) => setCurrentParent({ ...currentParent, parentalResponsibility: e.target.checked })}
                  />
                  Parental Responsibility
                </label>
              </div>
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentParent.doNotContact || false}
                    onChange={(e) => setCurrentParent({ ...currentParent, doNotContact: e.target.checked })}
                  />
                  Do Not Contact
                </label>
              </div>
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentParent.parentLivesWithStudent || false}
                    onChange={(e) => setCurrentParent({ ...currentParent, parentLivesWithStudent: e.target.checked })}
                  />
                  Parent Lives With Student
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentParent.estrangedParent || false}
                    onChange={(e) => setCurrentParent({ ...currentParent, estrangedParent: e.target.checked })}
                  />
                  Estranged Parent
                </label>
              </div>
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentParent.copyInLetters || false}
                    onChange={(e) => setCurrentParent({ ...currentParent, copyInLetters: e.target.checked })}
                  />
                  Copy in Letters
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-heading">
                <h2>Address</h2>
              </div>
              <div className="form-row">
                <Input
                  label="Apartment"
                  name="parent-address-apartment"
                  value={currentParent.address?.apartment || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, apartment: e.target.value } })}
                />
                <Input
                  label="House Name"
                  name="parent-address-house-name"
                  value={currentParent.address?.houseName || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, houseName: e.target.value } })}
                />
                <Input
                  label="House Number"
                  name="parent-address-house-number"
                  value={currentParent.address?.houseNumber || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, houseNumber: e.target.value } })}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Street"
                  name="parent-address-street"
                  value={currentParent.address?.street || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, street: e.target.value } })}
                />
                <Input
                  label="Town/City"
                  name="parent-address-town-city"
                  value={currentParent.address?.townCity || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, townCity: e.target.value } })}
                />
                <Input
                  label="District"
                  name="parent-address-district"
                  value={currentParent.address?.district || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, district: e.target.value } })}
                />
              </div>

              <div className="form-row">
                <Input
                  label="County"
                  name="parent-address-county"
                  value={currentParent.address?.county || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, county: e.target.value } })}
                />
                <Input
                  label="Administrative Area"
                  name="parent-address-administrative-area"
                  value={currentParent.address?.administrativeArea || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, administrativeArea: e.target.value } })}
                />
                <Input
                  label="Post Town"
                  name="parent-address-post-town"
                  value={currentParent.address?.postTown || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, postTown: e.target.value } })}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Postcode"
                  name="parent-address-postcode"
                  value={currentParent.address?.postcode || ''}
                  onChange={(e) => setCurrentParent({ ...currentParent, address: { ...currentParent.address, postcode: e.target.value } })}
                />
              </div>
            </div>

            <div>
              <TextField
                label="Notes"
                name="parent-notes"
                value={currentParent.notes || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, notes: e.target.value })}
                rows={4}
                textFieldWidth="97.7%"
              />  
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  // Emergency Contacts Tab
  const EmergencyContactsTab = () => {
    const contacts = studentData.emergencyContacts || [];
    const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
    const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
    type EmergencyContactType = NonNullable<StudentData['emergencyContacts']>[0];
    const [currentContact, setCurrentContact] = useState<EmergencyContactType>({
      name: '',
      relationship: '',
      dayPhone: '',
      eveningPhone: '',
      mobile: '',
      email: '',
      address: {},
    });

    const openAddContactPopup = () => {
      setCurrentContact({
        name: '',
        relationship: '',
        dayPhone: '',
        eveningPhone: '',
        mobile: '',
        email: '',
        address: {},
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
        dayPhone: '',
        eveningPhone: '',
        mobile: '',
        email: '',
        address: {},
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

      setStudentData({
        ...studentData,
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
        setStudentData({
          ...studentData,
          emergencyContacts: contacts.filter((_, i) => i !== index),
        });
        
        // Trigger autosave after removal
        setTimeout(() => {
          handleAutosave();
        }, 100);
      }
    };

    // Helper to format address for display
    const formatAddress = (addr?: { apartment?: string; houseName?: string; houseNumber?: string; street?: string; townCity?: string; county?: string; postcode?: string }): string => {
      if (!addr) return 'N/A';
      const parts = [
        addr.apartment,
        addr.houseName,
        addr.houseNumber,
        addr.street,
        addr.townCity,
        addr.county,
        addr.postcode
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
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
                    <th>Day Phone</th>
                    <th>Evening Phone</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, index) => (
                    <tr key={index}>
                      <td>{contact.name || 'N/A'}</td>
                      <td>{contact.relationship || 'N/A'}</td>
                      <td>{contact.dayPhone || 'N/A'}</td>
                      <td>{contact.eveningPhone || 'N/A'}</td>
                      <td>{contact.mobile || 'N/A'}</td>
                      <td>{contact.email || 'N/A'}</td>
                      <td>{formatAddress(contact.address)}</td>
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
                onBlur={handleAutosave}
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
                label="Day Phone"
                name="contact-day-phone"
                value={currentContact.dayPhone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, dayPhone: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
              <Input
                label="Evening Phone"
                name="contact-evening-phone"
                value={currentContact.eveningPhone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, eveningPhone: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Mobile"
                name="contact-mobile"
                value={currentContact.mobile || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, mobile: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Email"
                name="contact-email"
                type="email"
                value={currentContact.email || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
              <Input
                label="Apartment"
                name="contact-address-apartment"
                value={currentContact.address?.apartment || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, apartment: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="House Name"
                name="contact-address-house-name"
                value={currentContact.address?.houseName || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, houseName: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="House Number"
                name="contact-address-house-number"
                value={currentContact.address?.houseNumber || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, houseNumber: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
              <Input
                label="Street"
                name="contact-address-street"
                value={currentContact.address?.street || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, street: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Town/City"
                name="contact-address-town-city"
                value={currentContact.address?.townCity || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, townCity: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="County"
                name="contact-address-county"
                value={currentContact.address?.county || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, county: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
              <Input
                label="Postcode"
                name="contact-address-postcode"
                value={currentContact.address?.postcode || ''}
                onChange={(e) => setCurrentContact({ 
                  ...currentContact, 
                  address: { ...currentContact.address, postcode: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  // Medical Tab
  const MedicalTab = () => {
    const medical = studentData.medical;
    const [isMedicalPopupOpen, setIsMedicalPopupOpen] = useState(false);
    const [currentMedical, setCurrentMedical] = useState<NonNullable<StudentData['medical']>>({
      medicalDescription: medical?.medicalDescription || '',
      condition: medical?.condition || '',
      specialDiet: medical?.specialDiet || '',
      medication: medical?.medication || '',
      medicationCode: medical?.medicationCode || '',
      nhsNumber: medical?.nhsNumber || '',
      bloodGroup: medical?.bloodGroup || '',
      allergies: medical?.allergies || '',
      impairments: medical?.impairments || '',
      assistanceRequired: medical?.assistanceRequired || false,
      assistanceDescription: medical?.assistanceDescription || '',
      medicalConditionCategory: medical?.medicalConditionCategory || '',
      lastMedicalCheckDate: medical?.lastMedicalCheckDate || '',
      doctorDetails: medical?.doctorDetails || {
        name: '',
        relationship: '',
        mobile: '',
        daytimePhone: '',
        eveningPhone: '',
        email: '',
      },
      ehcp: medical?.ehcp || {
        hasEHCP: false,
      },
      senNotes: medical?.senNotes || '',
    });

    const openMedicalPopup = () => {
      setCurrentMedical({
        medicalDescription: medical?.medicalDescription || '',
        condition: medical?.condition || '',
        specialDiet: medical?.specialDiet || '',
        medication: medical?.medication || '',
        medicationCode: medical?.medicationCode || '',
        nhsNumber: medical?.nhsNumber || '',
        bloodGroup: medical?.bloodGroup || '',
        allergies: medical?.allergies || '',
        impairments: medical?.impairments || '',
        assistanceRequired: medical?.assistanceRequired || false,
        assistanceDescription: medical?.assistanceDescription || '',
        medicalConditionCategory: medical?.medicalConditionCategory || '',
        lastMedicalCheckDate: medical?.lastMedicalCheckDate || '',
        doctorDetails: medical?.doctorDetails || {
          name: '',
          relationship: '',
          mobile: '',
          daytimePhone: '',
          eveningPhone: '',
          email: '',
        },
        ehcp: medical?.ehcp || {
          hasEHCP: false,
        },
        senNotes: medical?.senNotes || '',
      });
      setIsMedicalPopupOpen(true);
    };

    const closeMedicalPopup = () => {
      setIsMedicalPopupOpen(false);
    };

    const saveMedical = () => {
      setStudentData({
        ...studentData,
        medical: currentMedical,
      });
      
      closeMedicalPopup();
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
    };

    const hasMedicalInfo = medical && (
      medical.medicalDescription ||
      medical.condition ||
      medical.specialDiet ||
      medical.medication ||
      medical.nhsNumber ||
      medical.bloodGroup ||
      medical.allergies ||
      medical.impairments ||
      medical.assistanceDescription ||
      medical.medicalConditionCategory ||
      medical.lastMedicalCheckDate ||
      medical.doctorDetails?.name ||
      medical.senNotes
    );

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <div className="form-heading">
              <h2>Medical Information</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openMedicalPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> {hasMedicalInfo ? 'Edit Medical Info' : 'Add Medical Info'}
              </button>
            </div>
          </div>

          {!hasMedicalInfo ? (
            <div className="empty-state">
              <p>No medical information added. Click "Add Medical Info" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Medical Description</th>
                    <th>Condition</th>
                    <th>Condition Category</th>
                    <th>Special Diet</th>
                    <th>Medication</th>
                    <th>Medication Code</th>
                    <th>Allergies</th>
                    <th>Impairments</th>
                    <th>Assistance Required</th>
                    <th>NHS Number</th>
                    <th>Blood Group</th>
                    <th>Last Medical Check</th>
                    <th>Doctor Name</th>
                    <th>Doctor Mobile</th>
                    <th>Has EHCP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{medical.medicalDescription || 'N/A'}</td>
                    <td>{medical.condition || 'N/A'}</td>
                    <td>{medical.medicalConditionCategory || 'N/A'}</td>
                    <td>{medical.specialDiet || 'N/A'}</td>
                    <td>{medical.medication || 'N/A'}</td>
                    <td>{medical.medicationCode || 'N/A'}</td>
                    <td>{medical.allergies || 'N/A'}</td>
                    <td>{medical.impairments || 'N/A'}</td>
                    <td>{medical.assistanceRequired !== undefined ? (medical.assistanceRequired ? 'Yes' : 'No') : 'N/A'}</td>
                    <td>{medical.nhsNumber || 'N/A'}</td>
                    <td>{medical.bloodGroup || 'N/A'}</td>
                    <td>{medical.lastMedicalCheckDate ? (typeof medical.lastMedicalCheckDate === 'string' ? medical.lastMedicalCheckDate.split('T')[0] : medical.lastMedicalCheckDate) : 'N/A'}</td>
                    <td>{medical.doctorDetails?.name || 'N/A'}</td>
                    <td>{medical.doctorDetails?.mobile || 'N/A'}</td>
                    <td>{medical.ehcp?.hasEHCP ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-edit-contact"
                          onClick={openMedicalPopup}
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Popup
          isOpen={isMedicalPopupOpen}
          onClose={closeMedicalPopup}
          title={hasMedicalInfo ? 'Edit Medical Information' : 'Add Medical Information'}
          width="800px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveMedical}
        >
          <form className="medical-popup-form">
            <div className="form-section">  
            <div className="form-heading">
              <h2>General Information</h2>
            </div>

            <div className="form-row">
              <TextField
                label="Medical Description"
                name="medical-description"
                value={currentMedical.medicalDescription || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, medicalDescription: e.target.value })}
                rows={3}
              />
              <TextField
                label="Condition"
                name="condition"
                value={currentMedical.condition || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, condition: e.target.value })}
                rows={3}
              />
               <TextField
                label="Special Diet"
                name="special-diet"
                value={currentMedical.specialDiet || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, specialDiet: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-row2">
              <TextField
                label="Allergies"
                name="allergies"
                value={currentMedical.allergies || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, allergies: e.target.value })}
                rows={3}
              />
              <TextField
                label="Medication"
                name="medication"
                value={currentMedical.medication || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, medication: e.target.value })}
                rows={3}
              />
             
            </div>

            <div className="form-row">
              <Input
                label="Medical Condition Category"
                name="medical-condition-category"
                value={currentMedical.medicalConditionCategory || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, medicalConditionCategory: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <DateInput
                label="Last Medical Check Date"
                name="last-medical-check-date"
                value={currentMedical.lastMedicalCheckDate}
                onChange={(e) => setCurrentMedical({ ...currentMedical, lastMedicalCheckDate: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="NHS Number"
                name="nhs-number"
                value={currentMedical.nhsNumber || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, nhsNumber: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
            </div>

             <div className="form-row2">
               <Select
                 label="Blood Group"
                 name="blood-group"
                 value={currentMedical.bloodGroup || ''}
                 onChange={(e) => setCurrentMedical({ ...currentMedical, bloodGroup: e.target.value })}
                 options={[
                   { value: 'A+', label: 'A+' },
                   { value: 'A-', label: 'A-' },
                   { value: 'B+', label: 'B+' },
                   { value: 'B-', label: 'B-' },
                   { value: 'AB+', label: 'AB+' },
                   { value: 'AB-', label: 'AB-' },
                   { value: 'O+', label: 'O+' },
                   { value: 'O-', label: 'O-' }
                 ]}
                 placeholder="Select blood group"
               />
               <Input
                label="Medication Code"
                name="medication-code"
                value={currentMedical.medicationCode || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, medicationCode: e.target.value })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentMedical.assistanceRequired || false}
                    onChange={(e) => setCurrentMedical({ ...currentMedical, assistanceRequired: e.target.checked })}
                  />
                  <span>Assistance Required</span>
                </label>
              </div>
            </div>

            {currentMedical.assistanceRequired && (
              <div>
                <TextField
                  label="Assistance Description"
                  name="assistance-description"
                  value={currentMedical.assistanceDescription || ''}
                  onChange={(e) => setCurrentMedical({ ...currentMedical, assistanceDescription: e.target.value })}
                  rows={3}
                  textFieldWidth="97.7%"
                />
              </div>
            )}

            <div className="form-row2">
              <TextField
                label="Impairments"
                name="impairments"
                value={currentMedical.impairments || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, impairments: e.target.value })}
                rows={3}
              />
              <TextField
                label="SEN Notes"
                name="sen-notes"
                value={currentMedical.senNotes || ''}
                onChange={(e) => setCurrentMedical({ ...currentMedical, senNotes: e.target.value })}
                rows={4}
                textFieldWidth="97.7%"
              />
            </div>
            </div>
            <div className="form-section">
            <div className="form-heading">
              <h2>Doctor Details</h2>
            </div>

            <div className="form-row">
              <Input
                label="Doctor Name"
                name="doctor-name"
                value={currentMedical.doctorDetails?.name || ''}
                onChange={(e) => setCurrentMedical({
                  ...currentMedical,
                  doctorDetails: { ...currentMedical.doctorDetails, name: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Relationship"
                name="doctor-relationship"
                value={currentMedical.doctorDetails?.relationship || ''}
                onChange={(e) => setCurrentMedical({
                  ...currentMedical,
                  doctorDetails: { ...currentMedical.doctorDetails, relationship: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Mobile"
                name="doctor-mobile"
                value={currentMedical.doctorDetails?.mobile || ''}
                onChange={(e) => setCurrentMedical({
                  ...currentMedical,
                  doctorDetails: { ...currentMedical.doctorDetails, mobile: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>

            <div className="form-row">
              <Input
                label="Daytime Phone"
                name="doctor-daytime-phone"
                value={currentMedical.doctorDetails?.daytimePhone || ''}
                onChange={(e) => setCurrentMedical({
                  ...currentMedical,
                  doctorDetails: { ...currentMedical.doctorDetails, daytimePhone: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Evening Phone"
                name="doctor-evening-phone"
                value={currentMedical.doctorDetails?.eveningPhone || ''}
                onChange={(e) => setCurrentMedical({
                  ...currentMedical,
                  doctorDetails: { ...currentMedical.doctorDetails, eveningPhone: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
              <Input
                label="Email"
                name="doctor-email"
                type="email"
                value={currentMedical.doctorDetails?.email || ''}
                onChange={(e) => setCurrentMedical({
                  ...currentMedical,
                  doctorDetails: { ...currentMedical.doctorDetails, email: e.target.value }
                })}
                onFocus={saveFocus}
                onBlur={handleAutosave}
              />
            </div>
            </div>
            <div className="form-section">
            <div className="form-heading">
              <h2>EHCP</h2>
            </div>
            <div className="form-row">
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={currentMedical.ehcp?.hasEHCP || false}
                    onChange={(e) => setCurrentMedical({
                      ...currentMedical,
                      ehcp: { ...currentMedical.ehcp, hasEHCP: e.target.checked }
                    })}
                  />
                  <span>Has EHCP</span>
                </label>
              </div>
            </div>
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  // Behaviour Tab
  const BehaviourTab = () => {
    const behaviour = studentData.behaviour;
    const [isBehaviourPopupOpen, setIsBehaviourPopupOpen] = useState(false);
    const [currentBehaviour, setCurrentBehaviour] = useState<NonNullable<StudentData['behaviour']>>({
      safeguardingConcern: behaviour?.safeguardingConcern || false,
      behaviourRiskLevel: behaviour?.behaviourRiskLevel || '',
      bodyMapPermission: behaviour?.bodyMapPermission || false,
      supportPlanDocument: behaviour?.supportPlanDocument || undefined,
      pastBehaviourNotes: behaviour?.pastBehaviourNotes || '',
    });

    const openBehaviourPopup = () => {
      setCurrentBehaviour({
        safeguardingConcern: behaviour?.safeguardingConcern || false,
        behaviourRiskLevel: behaviour?.behaviourRiskLevel || '',
        bodyMapPermission: behaviour?.bodyMapPermission || false,
        supportPlanDocument: behaviour?.supportPlanDocument || undefined,
        pastBehaviourNotes: behaviour?.pastBehaviourNotes || '',
      });
      setIsBehaviourPopupOpen(true);
    };

    const closeBehaviourPopup = () => {
      setIsBehaviourPopupOpen(false);
    };

    const saveBehaviour = () => {
      setStudentData({
        ...studentData,
        behaviour: currentBehaviour,
      });
      
      closeBehaviourPopup();
      
      // Trigger autosave after state update
      setTimeout(() => {
        handleAutosave();
      }, 100);
    };

    const hasBehaviourInfo = behaviour && (
      behaviour.safeguardingConcern !== undefined ||
      behaviour.behaviourRiskLevel ||
      behaviour.bodyMapPermission !== undefined ||
      behaviour.supportPlanDocument ||
      behaviour.pastBehaviourNotes
    );

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <div className="form-heading">
              <h2>Behaviour Information</h2>
              <button
                type="button"
                className="btn-add"
                onClick={openBehaviourPopup}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Behaviour Info
              </button>
            </div>
          </div>

          {!hasBehaviourInfo ? (
            <div className="empty-state">
              <p>No behaviour information added. Click "Add Behaviour Info" to add one.</p>
            </div>
          ) : (
            <div className="contacts-table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Safeguarding Concern</th>
                    <th>Behaviour Risk Level</th>
                    <th>Body Map Permission</th>
                    <th>Support Plan Document</th>
                    <th>Past Behaviour Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{behaviour.safeguardingConcern !== undefined ? (behaviour.safeguardingConcern ? 'Yes' : 'No') : 'N/A'}</td>
                    <td>{behaviour.behaviourRiskLevel || 'N/A'}</td>
                    <td>{behaviour.bodyMapPermission !== undefined ? (behaviour.bodyMapPermission ? 'Yes' : 'No') : 'N/A'}</td>
                    <td>{behaviour.supportPlanDocument?.fileName || 'N/A'}</td>
                    <td>{behaviour.pastBehaviourNotes || 'N/A'}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-edit-contact"
                          onClick={openBehaviourPopup}
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Popup
          isOpen={isBehaviourPopupOpen}
          onClose={closeBehaviourPopup}
          title={hasBehaviourInfo ? 'Edit Behaviour Information' : 'Add Behaviour Information'}
          width="800px"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={saveBehaviour}
        >
          <form className="behaviour-popup-form">
            <div className="form-section">
              <div className="form-heading">
                <h2>Behaviour Information</h2>
              </div>

              <div className="form-row">
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentBehaviour.safeguardingConcern || false}
                      onChange={(e) => setCurrentBehaviour({ ...currentBehaviour, safeguardingConcern: e.target.checked })}
                    />
                    <span>Safeguarding Concern</span>
                  </label>
                </div>
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentBehaviour.bodyMapPermission || false}
                      onChange={(e) => setCurrentBehaviour({ ...currentBehaviour, bodyMapPermission: e.target.checked })}
                    />
                    <span>Body Map Permission</span>
                  </label>
                </div>
                <Select
                  label="Behaviour Risk Level"
                  name="behaviour-risk-level"
                  value={currentBehaviour.behaviourRiskLevel || ''}
                  onChange={(e) => setCurrentBehaviour({ ...currentBehaviour, behaviourRiskLevel: e.target.value })}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Very High', label: 'Very High' }
                  ]}
                  placeholder="Select risk level"
                />
              </div>

              <div>
                <TextField
                  label="Past Behaviour Notes"
                  name="past-behaviour-notes"
                  value={currentBehaviour.pastBehaviourNotes || ''}
                  onChange={(e) => setCurrentBehaviour({ ...currentBehaviour, pastBehaviourNotes: e.target.value })}
                  rows={6}
                  textFieldWidth="97.7%"
                />
              </div>
            </div>
          </form>
        </Popup>
      </div>
    );
  };

  // Classes Tab
  interface ClassData {
    _id: string;
    location: string;
    fromDate: string;
    toDate: string;
    subject: string;
    yeargroup: string;
    students?: Array<{
      _id: string;
    }>;
  }

  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassData[]>([]);
  const previousEnrolledClassesRef = useRef<string[]>([]);
  const isInitialClassesMount = useRef(true);

  // Fetch all classes
  useEffect(() => {
    if (!isEditMode) return;

    const fetchAllClasses = async () => {
      try {
        const response = await executeRequest('get', '/classes?perPage=1000');
        if (Array.isArray(response)) {
          setAllClasses(response);
          
          // Find classes where this student is enrolled
          const studentId = id;
          const enrolled = response.filter((cls: ClassData) => 
            cls.students?.some((s: { _id: string }) => s._id === studentId)
          );
          setEnrolledClasses(enrolled);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchAllClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  // Auto-save when enrolled classes change (but not on initial mount)
  useEffect(() => {
    if (isInitialClassesMount.current) {
      isInitialClassesMount.current = false;
      previousEnrolledClassesRef.current = enrolledClasses.map(c => c._id);
      return;
    }
    if (!isEditMode || !id) return;
    
    const currentEnrolledClassIds = enrolledClasses.map(c => c._id);
    const previousEnrolledClassIds = previousEnrolledClassesRef.current;

    // Find classes to add (in current but not in previous)
    const classesToAdd = currentEnrolledClassIds.filter(
      classId => !previousEnrolledClassIds.includes(classId)
    );

    // Find classes to remove (in previous but not in current)
    const classesToRemove = previousEnrolledClassIds.filter(
      classId => !currentEnrolledClassIds.includes(classId)
    );

    // Add student to new classes
    classesToAdd.forEach(async (classId) => {
      try {
        await api.post(`/classes/${classId}/students/${id}`);
        console.log(`Added student to class ${classId}`);
      } catch (error) {
        console.error(`Error adding student to class ${classId}:`, error);
      }
    });

    // Remove student from classes
    classesToRemove.forEach(async (classId) => {
      try {
        await api.delete(`/classes/${classId}/students/${id}`);
        console.log(`Removed student from class ${classId}`);
      } catch (error) {
        console.error(`Error removing student from class ${classId}:`, error);
      }
    });

    // Update previous ref
    previousEnrolledClassesRef.current = currentEnrolledClassIds;
  }, [enrolledClasses, isEditMode, id]);

  // Add class to enrolled list
  const addClassToEnrolled = useCallback((classItem: ClassData) => {
    setEnrolledClasses(prev => [...prev, classItem]);
  }, []);

  // Remove class from enrolled list
  const removeClassFromEnrolled = useCallback((classItem: ClassData) => {
    setEnrolledClasses(prev => prev.filter(c => c._id !== classItem._id));
  }, []);


  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '--';
    }
  };

  const getClassDisplayName = (classItem: ClassData): string => {
    return `${classItem.location} - ${classItem.subject} (${classItem.yeargroup})`;
  };

  // Engagement Tab interfaces
  interface EngagementData {
    _id: string;
    class: string | {
      _id: string;
      location: string;
      subject: string;
      yeargroup: string;
      fromDate: string;
      toDate: string;
    };
    session: string;
    attendance: boolean;
    behaviour: string;
    comment?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  const EngagementTab = () => {
    const [engagements, setEngagements] = useState<EngagementData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Session options with labels
    const sessionLabels: Record<string, string> = useMemo(() => ({
      'breakfast club': 'Breakfast Club',
      'session1': 'Session 1',
      'break': 'Break',
      'session2': 'Session 2',
      'lunch': 'Lunch',
      'session3': 'Session 3',
    }), []);

    // Helper function to get behavior color
    const getBehaviourColor = useCallback((behaviour: string): string => {
      switch (behaviour) {
        case 'Good':
          return '#22c55e'; // green
        case 'Fair':
          return '#eab308'; // yellow
        case 'Average':
          return '#f97316'; // orange
        case 'Poor':
          return '#ef4444'; // red
        default:
          return '#6b7280'; // gray
      }
    }, []);

    // Behavior labels with colored dots
    const behaviourLabels: Record<string, string> = useMemo(() => ({
      'Good': 'Good',
      'Fair': 'Fair',
      'Average': 'Average',
      'Poor': 'Poor',
    }), []);

    // Fetch engagements for the student
    useEffect(() => {
      if (!isEditMode || !id) return;

      let isMounted = true;

      const fetchEngagements = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/engagements/student/${id}`);
          if (isMounted && Array.isArray(response.data)) {
            setEngagements(response.data);
          }
        } catch (error) {
          console.error('Error fetching engagements:', error);
          if (isMounted) {
            setEngagements([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchEngagements();

      return () => {
        isMounted = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);

    // Format class name
    const getClassName = (classData: string | { _id: string; location: string; subject: string; yeargroup: string; fromDate: string; toDate: string }): string => {
      if (typeof classData === 'string') {
        return classData;
      }
      return `${classData.location} - ${classData.subject} (${classData.yeargroup})`;
    };

    // Prepare table data
    const tableData = useMemo(() => {
      return engagements.map((engagement) => {
        const classData = engagement.class;
        const className = typeof classData === 'object' ? getClassName(classData) : 'Unknown Class';
        const sessionLabel = sessionLabels[engagement.session] || engagement.session;
        const behaviourValue = engagement.behaviour;
        const behaviourLabel = behaviourLabels[behaviourValue] || behaviourValue;
        const behaviorColor = getBehaviourColor(behaviourValue);
        const date = engagement.createdAt ? new Date(engagement.createdAt).toLocaleDateString() : '';

        return {
          _id: engagement._id,
          className,
          session: sessionLabel,
          attendance: engagement.attendance ? 'Yes' : 'No',
          behaviour: behaviourLabel,
          behaviorColor,
          comment: engagement.comment || '',
          date,
        };
      });
    }, [engagements, sessionLabels, behaviourLabels, getBehaviourColor]);

    // Define columns
    const columns = useMemo(() => [
      {
        header: 'Class',
        accessor: 'className',
        sortable: true,
        type: 'string' as const,
      },
      {
        header: 'Session',
        accessor: 'session',
        sortable: true,
        type: 'string' as const,
      },
      {
        header: 'Attendance',
        accessor: 'attendance',
        sortable: true,
        type: 'string' as const,
      },
      {
        header: 'Behavior',
        accessor: 'behaviour',
        sortable: true,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => {
          const behaviour = row.behaviour as string;
          const behaviorColor = row.behaviorColor as string;
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: behaviorColor,
                  display: 'inline-block',
                }}
              />
              {behaviour}
            </span>
          );
        },
      },
      {
        header: 'Comment',
        accessor: 'comment',
        sortable: false,
        type: 'string' as const,
      },
      {
        header: 'Date',
        accessor: 'date',
        sortable: true,
        type: 'date' as const,
      },
    ], []);

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="form-heading">
            <h2>Student Engagement</h2>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading engagements...
          </div>
        ) : engagements.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No engagement records found for this student.
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <DataTable
              columns={columns}
              data={tableData}
              title="Engagement Records"
              onEdit={() => {}}
              showActions={false}
              addButton={false}
              showSearch={true}
            />
          </div>
        )}
      </div>
    );
  };

  const ClassesTab = () => {
    // Filter state
    const [filterLocation, setFilterLocation] = useState<string>('');
    const [filterSubject, setFilterSubject] = useState<string>('');
    const [filterYearGroup, setFilterYearGroup] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

    // Filter options
    const locationOptions = [
      { value: '', label: 'All Locations' },
      { value: 'Warrington', label: 'Warrington' },
      { value: 'Burrow', label: 'Burrow' },
    ];

    const subjectOptions = [
      { value: '', label: 'All Subjects' },
      { value: 'Construction', label: 'Construction' },
      { value: 'Motor Vehicle', label: 'Motor Vehicle' },
      { value: 'Hairdressing', label: 'Hairdressing' },
      { value: 'Maths/English', label: 'Maths/English' },
      { value: 'Outreach / Post 16', label: 'Outreach / Post 16' },
    ];

    const yearGroupOptions = [
      { value: '', label: 'All Year Groups' },
      { value: 'Reception', label: 'Reception' },
      { value: 'Year 1', label: 'Year 1' },
      { value: 'Year 2', label: 'Year 2' },
      { value: 'Year 3', label: 'Year 3' },
      { value: 'Year 4', label: 'Year 4' },
      { value: 'Year 5', label: 'Year 5' },
      { value: 'Year 6', label: 'Year 6' },
      { value: 'Year 7', label: 'Year 7' },
      { value: 'Year 8', label: 'Year 8' },
      { value: 'Year 9', label: 'Year 9' },
      { value: 'Year 10', label: 'Year 10' },
      { value: 'Year 11', label: 'Year 11' },
      { value: 'Year 12', label: 'Year 12' },
      { value: 'Year 13', label: 'Year 13' },
    ];

    // Filter available classes based on filter criteria
    const baseAvailable = allClasses.filter(
      classItem => !enrolledClasses.some(enrolled => enrolled._id === classItem._id)
    );
    
    const availableClasses = baseAvailable.filter(classItem => {
      // Location filter
      if (filterLocation && classItem.location !== filterLocation) {
        return false;
      }

      // Subject filter
      if (filterSubject && classItem.subject !== filterSubject) {
        return false;
      }

      // Year group filter
      if (filterYearGroup && classItem.yeargroup !== filterYearGroup) {
        return false;
      }

      // Start date filter
      if (filterStartDate) {
        const classStartDate = new Date(classItem.fromDate);
        const filterStart = new Date(filterStartDate);
        if (classStartDate < filterStart) {
          return false;
        }
      }

      // End date filter
      if (filterEndDate) {
        const classEndDate = new Date(classItem.toDate);
        const filterEnd = new Date(filterEndDate);
        if (classEndDate > filterEnd) {
          return false;
        }
      }

      return true;
    });

    // Clear all filters
    const clearFilters = () => {
      setFilterLocation('');
      setFilterSubject('');
      setFilterYearGroup('');
      setFilterStartDate('');
      setFilterEndDate('');
    };

    if (!isEditMode) {
      return (
        <div className="tab-content">
          <div className="empty-state">
            <p>Please save the student first to manage class enrollments.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="tab-content">
        <div className="form-section">
          <div className="section-header">
            <div className="form-heading">
              <h2>Class Enrollment</h2>
            </div>
          </div>

          <div className="classes-lists-container">
            <div className="classes-list-panel">
              <div className="panel-header">
                <div className="form-section" style={{ paddingLeft: '20px', margin: '0', paddingBottom: '0' }}>
                  <div className="form-heading">
                    <h2>Available Classes ({availableClasses.length})</h2>
                  </div>
                </div>
              </div>
              
              {/* Filter Component */}
              <div className="classes-filter-section">
                <div className="filter-header">
                  <div className="filter-header-left">
                    <button 
                      type="button" 
                      onClick={() => setIsFilterOpen(!isFilterOpen)} 
                      className="btn-toggle-filter"
                    >
                      <FontAwesomeIcon icon={isFilterOpen ? faChevronUp : faChevronDown} />
                    </button>
                    <h3>Filter Classes</h3>
                  </div>
                  <div className="filter-header-right">
                    <button type="button" onClick={clearFilters} className="btn-clear-filters">
                      Clear Filters
                    </button>
                  </div>
                </div>
                {isFilterOpen && (
                  <div className="filter-fields">
                  <Select
                    label="Location"
                    name="filterLocation"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    options={locationOptions}
                    placeholder="All Locations"
                  />
                  <Select
                    label="Subject"
                    name="filterSubject"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    options={subjectOptions}
                    placeholder="All Subjects"
                  />
                  <Select
                    label="Year Group"
                    name="filterYearGroup"
                    value={filterYearGroup}
                    onChange={(e) => setFilterYearGroup(e.target.value)}
                    options={yearGroupOptions}
                    placeholder="All Year Groups"
                  />
                  <DateInput
                    label="Start Date (From)"
                    name="filterStartDate"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    max={filterEndDate || undefined}
                  />
                  <DateInput
                    label="End Date (To)"
                    name="filterEndDate"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    min={filterStartDate || undefined}
                  />
                  </div>
                )}
              </div>

              <div className="classes-list">
                {availableClasses.length === 0 ? (
                  <p className="empty-list">No classes match the filter criteria.</p>
                ) : (
                  availableClasses.map(classItem => (
                    <div
                      key={classItem._id}
                      className="class-item"
                      onClick={() => addClassToEnrolled(classItem)}
                    >
                      <div className="class-item-info">
                        <div className="class-item-name">{getClassDisplayName(classItem)}</div>
                        <div className="class-item-details">
                          {formatDate(classItem.fromDate)} - {formatDate(classItem.toDate)}
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="classes-list-panel">
              <div className="panel-header">
                <div className="form-section" style={{ paddingRight: '20px', margin: '0', paddingBottom: '0' }}>
                  <div className="form-heading">
                    <h2>Enrolled Classes ({enrolledClasses.length})</h2>
                  </div>
                </div>
              </div>
              <div className="classes-list">
                {enrolledClasses.length === 0 ? (
                  <p className="empty-list">No classes enrolled.</p>
                ) : (
                  enrolledClasses.map(classItem => (
                    <div
                      key={classItem._id}
                      className="class-item"
                      onClick={() => removeClassFromEnrolled(classItem)}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="arrow-icon" />
                      &nbsp;&nbsp;
                      <div className="class-item-info">
                        <div className="class-item-name">{getClassDisplayName(classItem)}</div>
                        <div className="class-item-details">
                          {formatDate(classItem.fromDate)} - {formatDate(classItem.toDate)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Time Table Tab
  const TimeTableTab = () => (
    <div className="tab-content">
      <div className="timetable-tab-wrapper">
        <TimeTableComponent
          onTimeSlotButtonPress={() => {}}
          propEvents={[]}
        />
      </div>
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Information', content: <BasicInfoTab /> },
    { id: 'parents', label: 'Parents', content: <ParentsTab /> },
    { id: 'emergency', label: 'Emergency Contacts', content: <EmergencyContactsTab /> },
    { id: 'medical', label: 'Medical', content: <MedicalTab /> },
    { id: 'behaviour', label: 'Behaviour', content: <BehaviourTab /> },
    { id: 'classes', label: 'Classes', content: <ClassesTab /> },
    { id: 'engagement', label: 'Engagement', content: <EngagementTab /> },
    { id: 'timetable', label: 'Time Table', content: <TimeTableTab /> },
  ];

  return (
    <Layout>
      <div className="new-staff">
        <div className="new-staff-header">
          <h1>{isEditMode ? 'Edit Student' : 'Add New Student'}</h1>
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

export default EditStudent;

