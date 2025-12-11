import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../../layouts/layout';
import Input from '../../../components/input/Input';
import Select from '../../../components/Select/Select';
import TextField from '../../../components/textField/TextField';
import Popup from '../../../components/Popup/Popup';
import { Tabs } from '../../../components/Tabs/Tabs';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import './index.scss';

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

const EditStudent = () => {
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

  // Track student ID (always set in edit mode)
  const studentIdRef = useRef<string | null>(id || null);
  const studentDataRef = useRef(studentData);

  // Keep refs in sync with state
  useEffect(() => {
    studentDataRef.current = studentData;
  }, [studentData]);

  // Redirect if no id
  useEffect(() => {
    if (!id) {
      navigate('/students');
    }
  }, [id, navigate]);

  // Track if data has been fetched
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch student data
  useEffect(() => {
    if (!id || hasFetched) return;
    
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
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent, isAutosave: boolean = false) => {
    if (e) {
      e.preventDefault();
    }

    // Use refs for autosave to get latest state, or state for manual save
    const currentData = isAutosave ? studentDataRef.current : studentData;
    const currentId = id || studentIdRef.current;

    if (!currentId) {
      alert('Student ID is missing');
      return;
    }

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
      // Always update in edit mode
      await executeRequest('patch', `/students/${currentId}`, cleanedData);

      // Only show alerts and navigate for manual saves
      if (!isAutosave) {
        alert('Student updated successfully!');
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
      const currentId = id || studentIdRef.current;

      if (!currentId) {
        return;
      }

      // Skip if required fields are missing
      if (!currentData.personalInfo.legalFirstName || !currentData.personalInfo.lastName) {
        return;
      }

      // Clean data
      const cleanedData = cleanEmptyDateStrings(currentData);

      // Perform autosave - use API directly to avoid triggering loading state
      api.patch(`/students/${currentId}`, cleanedData)
        .then((response) => {
          console.log('Autosave successful:', response.data);
        })
        .catch((error) => {
          // Silently log autosave errors
          console.error('Autosave error:', error);
        });
    }, 100); // Small delay to ensure state is updated
  }, [cleanEmptyDateStrings, id]);

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
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
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
          <Input
            label="Admission Date"
            name="admissionDate"
            type="date"
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
        </div>
        
        <div className="form-row">
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
                className="btn-add-contact"
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

            <div className="form-row">
              <TextField
                label="Notes"
                name="parent-notes"
                value={currentParent.notes || ''}
                onChange={(e) => setCurrentParent({ ...currentParent, notes: e.target.value })}
                rows={4}
              />
            </div>
          </form>
        </Popup>
      </div>
    );
  };

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

  if (!id) {
    return null;
  }

  return (
    <Layout>
      <div className="new-staff">
        <div className="new-staff-header">
          <h1>Edit Student Member</h1>
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

