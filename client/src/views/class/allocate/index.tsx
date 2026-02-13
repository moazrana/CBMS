import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../../layouts/layout';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import Select from '../../../components/Select/Select';
import Input from '../../../components/input/Input';
import './index.scss';

interface Class {
  _id: string;
  location: string;
  fromDate: string;
  toDate: string;
  subject: string;
  yeargroup: string;
  students?: Array<{
    _id: string;
    personalInfo?: {
      legalFirstName?: string;
      lastName?: string;
      preferredName?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  personalInfo?: {
    legalFirstName?: string;
    lastName?: string;
    preferredName?: string;
    yearGroup?: string;
    adno?: string;
    location?: string;
  };
}

const AllocateStudents = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { executeRequest } = useApiRequest();
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  
  // Filter state for available students
  const [filterName, setFilterName] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterYearGroup, setFilterYearGroup] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  
  // Refs for autosave
  const classStudentsRef = useRef<string[]>([]);
  const isInitialMount = useRef(true);

  // Update ref when state changes
  useEffect(() => {
    classStudentsRef.current = classStudents.map(s => s._id);
  }, [classStudents]);

  // Auto-save when classStudents change (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    autoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classStudents]);

  // Fetch class data
  useEffect(() => {
    if (id) {
      const fetchClass = async () => {
        try {
          const response = await executeRequest('get', `/classes/${id}`);
          setClassData(response);
          setClassStudents(response.students || []);
        } catch (error) {
          console.error('Error fetching class:', error);
          alert('Failed to load class data');
          navigate('/classes');
        }
      };
      fetchClass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch all students
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        // Fetch with a large perPage to get all students
        const response = await executeRequest('get', '/students?perPage=1000');
        if (Array.isArray(response)) {
          setAllStudents(response);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchAllStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter options
  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'Warrington', label: 'Warrington' },
    { value: 'Bury', label: 'Bury' },
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

  // Base available students: all students minus students already in class
  const baseAvailableStudents = allStudents.filter(
    student => !classStudents.some(classStudent => classStudent._id === student._id)
  );

  // Filter available students based on filter criteria
  const availableStudents = baseAvailableStudents.filter(student => {
    // Name filter (search in preferred name, legal first name, or last name)
    if (filterName) {
      const searchTerm = filterName.toLowerCase();
      const personalInfo = student.personalInfo || {};
      const preferredName = personalInfo.preferredName?.toLowerCase() || '';
      const legalFirstName = personalInfo.legalFirstName?.toLowerCase() || '';
      const lastName = personalInfo.lastName?.toLowerCase() || '';
      const fullName = `${legalFirstName} ${lastName}`.trim().toLowerCase();
      
      if (!preferredName.includes(searchTerm) && 
          !legalFirstName.includes(searchTerm) && 
          !lastName.includes(searchTerm) &&
          !fullName.includes(searchTerm)) {
        return false;
      }
    }

    // Location filter
    if (filterLocation && student.personalInfo?.location !== filterLocation) {
      return false;
    }

    // Year group filter
    if (filterYearGroup && student.personalInfo?.yearGroup !== filterYearGroup) {
      return false;
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilterName('');
    setFilterLocation('');
    setFilterYearGroup('');
  };

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!id || !classData) return;

    const studentIds = classStudentsRef.current;

    try {
      await api.patch(`/classes/${id}`, {
        location: classData.location,
        fromDate: classData.fromDate,
        toDate: classData.toDate,
        subject: classData.subject,
        yeargroup: classData.yeargroup,
        students: studentIds,
      });
      console.log('Auto-saved students allocation');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [id, classData]);

  // Move student to class
  const addStudentToClass = useCallback((student: Student) => {
    setClassStudents(prev => [...prev, student]);
  }, []);

  // Remove student from class
  const removeStudentFromClass = useCallback((student: Student) => {
    setClassStudents(prev => prev.filter(s => s._id !== student._id));
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

  const getStudentFullName = (student: Student): string => {
    const personalInfo = student.personalInfo || {};
    if (personalInfo.legalFirstName && personalInfo.lastName) {
      return `${personalInfo.legalFirstName} ${personalInfo.lastName}`;
    }
    if (personalInfo.legalFirstName) {
      return personalInfo.legalFirstName;
    }
    if (personalInfo.lastName) {
      return personalInfo.lastName;
    }
    return 'Unknown Student';
  };

  if (!classData) {
    return (
      <Layout>
        <div className="allocate-students">
          <div>Loading class data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="allocate-students">
        <div className="allocate-header">
          {/* <button 
            onClick={() => navigate('/classes')}
            className="back-button"
            style={{
              padding: '0.5rem 1rem',
              marginBottom: '1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--main-text)'
            }}
          >
            ← Back to Classes
          </button> */}
          <h1>Allocate Students to Class</h1>
        </div>

        {/* Class Information */}
        <div className="class-info-section">
            <div className="form-section">
                <div className="form-heading">
                    <h2>Class Information</h2>
                </div>
                <div className="class-info-grid">
                    <div className="info-item">
                    <label>Location:</label>
                    <span>{classData.location}</span>
                    </div>
                    <div className="info-item">
                    <label>Subject:</label>
                    <span>{classData.subject}</span>
                    </div>
                    <div className="info-item">
                    <label>Year Group:</label>
                    <span>{classData.yeargroup}</span>
                    </div>
                    <div className="info-item">
                    <label>From Date:</label>
                    <span>{formatDate(classData.fromDate)}</span>
                    </div>
                    <div className="info-item">
                    <label>To Date:</label>
                    <span>{formatDate(classData.toDate)}</span>
                    </div>
                    <div className="info-item">
                    <label>Students in Class:</label>
                    <span>{classStudents.length}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Two Lists Section */}
        <div className="students-lists-container">
          {/* Available Students List */}
          <div className="students-list-panel">
            <div className="panel-header">
                <div className="form-section" style={{ paddingLeft: '20px', margin: '0',paddingBottom: '0' }}>
                    <div className="form-heading">
                        <h2>Available Students ({availableStudents.length})</h2>
                    </div>
                </div>
            </div>
            
            {/* Filter Component */}
            <div className="students-filter-section">
              <div className="filter-header">
                <div className="filter-header-left">
                  <button 
                    type="button" 
                    onClick={() => setIsFilterOpen(!isFilterOpen)} 
                    className="btn-toggle-filter"
                  >
                    <FontAwesomeIcon icon={isFilterOpen ? faChevronUp : faChevronDown} />
                  </button>
                  <h3>Filter Students</h3>
                </div>
                <div className="filter-header-right">
                  <button type="button" onClick={clearFilters} className="btn-clear-filters">
                    Clear Filters
                  </button>
                </div>
              </div>
              {isFilterOpen && (
                <div className="filter-fields">
                  <Input
                    label="Name"
                    name="filterName"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Search by name..."
                  />
                  <Select
                    label="Location"
                    name="filterLocation"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    options={locationOptions}
                    placeholder="All Locations"
                  />
                  <Select
                    label="Year Group"
                    name="filterYearGroup"
                    value={filterYearGroup}
                    onChange={(e) => setFilterYearGroup(e.target.value)}
                    options={yearGroupOptions}
                    placeholder="All Year Groups"
                  />
                </div>
              )}
            </div>

            <div className="students-list">
              {availableStudents.length === 0 ? (
                <div className="empty-list">No available students</div>
              ) : (
                availableStudents.map((student) => (
                  <div
                    key={student._id}
                    className="student-item"
                    onClick={() => addStudentToClass(student)}
                  >
                    <div className="student-name">{getStudentFullName(student)}</div>
                    <div className="student-details">
                      <div className="student-detail-row">
                        {student.personalInfo?.location && (
                          <span className="student-location">
                            <strong>Location:</strong> {student.personalInfo.location}
                          </span>
                        )}
                        {student.personalInfo?.yearGroup && (
                          <span className="student-year">
                            <strong>Year Group:</strong> {student.personalInfo.yearGroup}
                          </span>
                        )}
                      </div>
                      {student.personalInfo?.adno && (
                        <div className="student-detail-row">
                          <span className="student-adno">
                            <strong>Admission Number:</strong> {student.personalInfo.adno}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="action-indicator">Click to add →</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Class Students List */}
          <div className="students-list-panel">
            <div className="panel-header">
                <div className="form-section" style={{ paddingRight: '20px', margin: '0',paddingBottom: '0' }}>
                    <div className="form-heading">
                        <h2>Students in Class ({classStudents.length})</h2>
                    </div>
                </div>
            </div>
            <div className="students-list">
              {classStudents.length === 0 ? (
                <div className="empty-list">No students in this class</div>
              ) : (
                classStudents.map((student) => (
                  <div
                    key={student._id}
                    className="student-item in-class"
                    onClick={() => removeStudentFromClass(student)}
                  >
                    <div className="student-name">{getStudentFullName(student)}</div>
                    <div className="student-details">
                      <div className="student-detail-row">
                        {student.personalInfo?.location && (
                          <span className="student-location">
                            <strong>Location:</strong> {student.personalInfo.location}
                          </span>
                        )}
                        {student.personalInfo?.yearGroup && (
                          <span className="student-year">
                            <strong>Year Group:</strong> {student.personalInfo.yearGroup}
                          </span>
                        )}
                      </div>
                      {student.personalInfo?.adno && (
                        <div className="student-detail-row">
                          <span className="student-adno">
                            <strong>Admission Number:</strong> {student.personalInfo.adno}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="action-indicator">← Click to remove</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllocateStudents;

