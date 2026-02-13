import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../layouts/layout';
import Select from '../../../components/Select/Select';
import DateInput from '../../../components/dateInput/DateInput';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import './index.scss';

interface ClassData {
  location: string;
  fromDate: string;
  toDate: string;
  subject: string;
  yeargroup: string;
  notes?: string;
}

const EditClass = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { executeRequest, loading } = useApiRequest();
  const isEditMode = !!id;

  const [classData, setClassData] = useState<ClassData>({
    location: '',
    fromDate: '',
    toDate: '',
    subject: '',
    yeargroup: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClassData, string>>>({});
  const [hasFetched, setHasFetched] = useState(false);

  // Refs for autosave
  const classDataRef = useRef<ClassData>(classData);
  const classIdRef = useRef<string | undefined>(id);

  // Update refs when state changes
  useEffect(() => {
    classDataRef.current = classData;
  }, [classData]);

  useEffect(() => {
    classIdRef.current = id;
  }, [id]);

  // Year group options
  const yearGroupOptions = [
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
    { value: 'All', label: 'All' },
  ];

  // Location options
  const locationOptions = [
    { value: 'Warrington', label: 'Warrington' },
    { value: 'Bury', label: 'Bury' },
  ];

  // Subject options
  const subjectOptions = [
    { value: 'Construction', label: 'Construction' },
    { value: 'Motor Vehicle', label: 'Motor Vehicle' },
    { value: 'Hairdressing', label: 'Hairdressing' },
    { value: 'Maths/English', label: 'Maths/English' },
    { value: 'Outreach / Post 16', label: 'Outreach / Post 16' },
  ];


  // Fetch class data if in edit mode
  useEffect(() => {
    if (!id || hasFetched || !isEditMode) return;
    
    const fetchClass = async () => {
      try {
        const response = await executeRequest('get', `/classes/${id}`);
        if (response) {
          setClassData({
            location: response.location || '',
            fromDate: response.fromDate ? new Date(response.fromDate).toISOString().split('T')[0] : '',
            toDate: response.toDate ? new Date(response.toDate).toISOString().split('T')[0] : '',
            subject: response.subject || '',
            yeargroup: response.yeargroup || '',
            notes: response.notes || '',
          });
          setHasFetched(true);
        }
      } catch (error) {
        console.error('Error fetching class:', error);
        alert('Failed to load class data');
      }
    };

    fetchClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClassData, string>> = {};

    if (!classData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!classData.fromDate) {
      newErrors.fromDate = 'From date is required';
    }

    if (!classData.toDate) {
      newErrors.toDate = 'To date is required';
    }

    if (classData.fromDate && classData.toDate) {
      const from = new Date(classData.fromDate);
      const to = new Date(classData.toDate);
      if (to < from) {
        newErrors.toDate = 'To date must be after from date';
      }
    }

    if (!classData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!classData.yeargroup) {
      newErrors.yeargroup = 'Year group is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        location: classData.location,
        fromDate: classData.fromDate,
        toDate: classData.toDate,
        subject: classData.subject,
        yeargroup: classData.yeargroup,
        notes: classData.notes || '',
      };

      if (isEditMode && id) {
        await executeRequest('patch', `/classes/${id}`, submitData);
        alert('Class updated successfully');
      } else {
        await executeRequest('post', '/classes', submitData);
        alert('Class created successfully');
      }

      navigate('/classes');
    } catch (error: unknown) {
      console.error('Error saving class:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(errorMessage || 'Failed to save class. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/classes');
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
      const currentData = classDataRef.current;
      const currentId = classIdRef.current;

      // Only autosave when editing an existing class; never POST on blur (prevents duplicate classes)
      if (!currentId) return;

      // Skip if required fields are missing
      if (!currentData.location || !currentData.fromDate || !currentData.toDate || !currentData.subject || !currentData.yeargroup) {
        return;
      }

      const submitData = {
        location: currentData.location,
        fromDate: currentData.fromDate,
        toDate: currentData.toDate,
        subject: currentData.subject,
        yeargroup: currentData.yeargroup,
        notes: currentData.notes || '',
      };

      api.patch(`/classes/${currentId}`, submitData)
        .then((response) => {
          console.log('Autosave successful:', response.data);
        })
        .catch((error) => {
          console.error('Autosave error:', error);
        });
    }, 100);
  }, []);

  return (
    <Layout>
      <div className="edit-class">
        <div className="edit-class-header">
          <h1>{isEditMode ? 'Edit Class' : 'Create New Class'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="edit-class-form">
          <div className="form-section">
            <div className="form-heading">
              <h2>Class Information</h2>
            </div>

            <div className="form-row">
              <Select
                label="Location *"
                name="location"
                value={classData.location}
                onChange={(e) => {
                  setClassData({ ...classData, location: e.target.value });
                  if (errors.location) setErrors({ ...errors, location: undefined });
                }}
                onBlur={handleAutosave}
                options={locationOptions}
                placeholder="Select Location"
                required
                error={errors.location}
              />
              <Select
                label="Subject *"
                name="subject"
                value={classData.subject}
                onChange={(e) => {
                  setClassData({ ...classData, subject: e.target.value });
                  if (errors.subject) setErrors({ ...errors, subject: undefined });
                }}
                onBlur={handleAutosave}
                options={subjectOptions}
                placeholder="Select Subject"
                required
                error={errors.subject}
              />
            </div>

            <div className="form-row">
              <DateInput
                label="From Date *"
                name="fromDate"
                value={classData.fromDate}
                onChange={(e) => {
                  setClassData({ ...classData, fromDate: e.target.value });
                  if (errors.fromDate) setErrors({ ...errors, fromDate: undefined });
                }}
                onBlur={handleAutosave}
                required
                error={errors.fromDate}
                max={classData.toDate || undefined}
              />
              <DateInput
                label="To Date *"
                name="toDate"
                value={classData.toDate}
                onChange={(e) => {
                  setClassData({ ...classData, toDate: e.target.value });
                  if (errors.toDate) setErrors({ ...errors, toDate: undefined });
                }}
                onBlur={handleAutosave}
                required
                error={errors.toDate}
                min={classData.fromDate || undefined}
              />
            </div>

            <div className="form-row">
              <Select
                label="Year Group *"
                name="yeargroup"
                value={classData.yeargroup}
                onChange={(e) => {
                  setClassData({ ...classData, yeargroup: e.target.value });
                  if (errors.yeargroup) setErrors({ ...errors, yeargroup: undefined });
                }}
                onBlur={handleAutosave}
                options={yearGroupOptions}
                placeholder="Select Year Group"
                required
                error={errors.yeargroup}
              />
            </div>

            <div className="form-row">
              <div className="textarea-container">
                <label htmlFor="notes" className="textarea-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={classData.notes || ''}
                  onChange={(e) => {
                    setClassData({ ...classData, notes: e.target.value });
                  }}
                  onBlur={handleAutosave}
                  className="textarea-field"
                  rows={6}
                  placeholder="Enter any additional notes about this class..."
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditClass;

