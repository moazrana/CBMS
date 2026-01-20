import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Layout from '../../layouts/layout';
import './index.scss';
import FilterSec from '../../components/FilterSec/FilterSec';
import DataTable from '../../components/DataTable/DataTable';
import Select from '../../components/Select/Select';
import BehaviorSelect from '../../components/BehaviorSelect/BehaviorSelect';
import Input from '../../components/input/Input';
import DateInput from '../../components/dateInput/DateInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import locationIcon from '../../assets/safeguarding/location.svg';
import Class from '../../assets/safeguarding/class.svg';
import Subject from '../../assets/safeguarding/subject.svg';
import { DropdownOption } from '../../types/DropDownOption';
import { useApiRequest } from '../../hooks/useApiRequest';
import api from '../../services/api';

interface StudentData {
  _id: string;
  personalInfo?: {
    legalFirstName?: string;
    middleName?: string;
    lastName?: string;
  };
}

interface EngagementRow {
  studentId: string;
  name: string;
  session?: string; // Session for single session view
  attendance: boolean;
  behaviour: string;
  comment: string;
  engagementId?: string; // ID of existing engagement record
}

interface SessionEngagement {
  attendance: boolean;
  behaviour: string;
  comment: string;
  engagementId?: string;
}

interface StudentEngagementData {
  studentId: string;
  name: string;
  sessions: Record<string, SessionEngagement>; // Key is session value
}

interface ExistingEngagement {
  _id: string;
  class: string;
  session: string;
  student: string;
  attendance: boolean;
  behaviour: string;
  comment?: string;
}

interface ClassData {
  _id: string;
  location: string;
  subject: string;
  yeargroup: string;
  fromDate: string;
  toDate: string;
  students?: StudentData[];
}

const Engagement: React.FC = () => {
  const { executeRequest } = useApiRequest();
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [engagementDate, setEngagementDate] = useState<string>(today);
  const [location, setLocation] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [locationOptions] = useState<DropdownOption[]>([{"label":"Warrington","value":"Warrington"},{"label":"Burrow","value":"Burrow"}]);
  const [subjectOptions] = useState<DropdownOption[]>([
    { value: 'Construction', label: 'Construction' },
    { value: 'Motor Vehicle', label: 'Motor Vehicle' },
    { value: 'Hairdressing', label: 'Hairdressing' },
    { value: 'Maths/English', label: 'Maths/English' },
    { value: 'Outreach / Post 16', label: 'Outreach / Post 16' },
  ]);
  const [classOptions, setClassOptions] = useState<DropdownOption[]>([]);
  const [filterClass, setFilterClass] = useState<string>("");
  const [students, setStudents] = useState<StudentData[]>([]);
  const [engagementData, setEngagementData] = useState<Record<string, EngagementRow>>({});
  const [allSessionsEngagementData, setAllSessionsEngagementData] = useState<Record<string, StudentEngagementData>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Refs to track if we should skip autosave (e.g., on initial load)
  const engagementDataRef = useRef<Record<string, EngagementRow>>({});
  const allSessionsEngagementDataRef = useRef<Record<string, StudentEngagementData>>({});
  const isInitialMount = useRef(true);
  const filterClassRef = useRef<string>("");
  
  // Toggle row expansion
  const toggleRowExpansion = useCallback((studentId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);
  
  const sessionOptions: DropdownOption[] = useMemo(() => [
    { value: 'breakfast club', label: 'Breakfast Club' },
    { value: 'session1', label: 'Session 1' },
    { value: 'break', label: 'Break' },
    { value: 'session2', label: 'Session 2' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'session3', label: 'Session 3' },
  ], []);

  // Get first 5 sessions for the second row (excluding the session dropdown selection)
  const displaySessions = useMemo(() => sessionOptions.slice(0, 5), [sessionOptions]);
  
  // Helper function to get behavior color
  const getBehaviourColor = (behaviour: string): string => {
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
  };


  const behaviourOptions: DropdownOption[] = useMemo(() => [
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Average', label: 'Average' },
    { value: 'Poor', label: 'Poor' },
  ], []);

  const behaviorSelectOptions = useMemo(() => [
    { value: 'Good', label: 'Good', color: '#22c55e' },
    { value: 'Fair', label: 'Fair', color: '#eab308' },
    { value: 'Average', label: 'Average', color: '#f97316' },
    { value: 'Poor', label: 'Poor', color: '#ef4444' },
  ], []);
  const filterContent = (
    <>
        <div className="inputs-div-tt">
          <div className="input-div-engagement">
            <Select 
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={locationOptions}
              placeholder="Select Location"
              icon={locationIcon}
            />
          </div>
          <div className="input-div-engagement">
            <Select 
              label="Subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={subjectOptions}
              placeholder="Select Subject"
              icon={Subject}
            />
          </div>
          <div className="input-div-engagement">
            <Select 
              label="Class/Provision"
              name="class"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              options={classOptions}
              placeholder="Select Class/Provision"
              icon={Class}
              disabled={classOptions.length === 0}
            />
          </div>
        </div>
    </>
);
  useEffect(() => {
    const fetchClasses = async () => {
      // If neither location nor subject is selected, clear classes
      if (!location && !subject) {
        setClassOptions([]);
        setFilterClass("");
        return;
      }

      try {
        // Fetch all classes (with a high perPage to get all)
        const response = await executeRequest('get', '/classes?perPage=1000');
        
        if (Array.isArray(response)) {
          // Filter classes by location and/or subject
          const filteredClasses = response.filter((cls: ClassData) => {
            const matchesLocation = !location || cls.location === location;
            const matchesSubject = !subject || cls.subject === subject;
            return matchesLocation && matchesSubject;
          });
          
          // Transform to DropdownOption format
          const options: DropdownOption[] = filteredClasses.map((cls: ClassData) => ({
            label: `${cls.subject} - ${cls.yeargroup}`,
            value: cls._id
          }));
          
          setClassOptions(options);
          // Reset selected class when filters change
          setFilterClass("");
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setClassOptions([]);
        setFilterClass("");
      }
    };

    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, subject]);

  // Update refs when state changes
  useEffect(() => {
    engagementDataRef.current = engagementData;
  }, [engagementData]);

  useEffect(() => {
    allSessionsEngagementDataRef.current = allSessionsEngagementData;
  }, [allSessionsEngagementData]);

  useEffect(() => {
    filterClassRef.current = filterClass;
  }, [filterClass]);

  // Fetch students when a class is selected
  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!filterClass) {
        setStudents([]);
        setEngagementData({});
        setAllSessionsEngagementData({});
        return;
      }

      try {
        const response = await executeRequest('get', `/classes/${filterClass}`);
        const classData = response as ClassData;
        
        // Always set students, even if empty array
        const studentsList = Array.isArray(classData.students) ? classData.students : [];
        setStudents(studentsList);
        
        if (studentsList.length > 0) {
          
          // Initialize engagement data for each student (for single session view)
          const initialEngagement: Record<string, EngagementRow> = {};
          // Initialize all sessions engagement data
          const initialAllSessions: Record<string, StudentEngagementData> = {};
          
          studentsList.forEach((student: StudentData) => {
            const name = `${student.personalInfo?.legalFirstName || ''} ${student.personalInfo?.middleName || ''} ${student.personalInfo?.lastName || ''}`.trim();
            initialEngagement[student._id] = {
              studentId: student._id,
              name,
              session: sessionOptions[0]?.value || '',
              attendance: false,
              behaviour: 'Good',
              comment: '',
            };
            
            // Initialize all sessions for this student
            const sessionsData: Record<string, SessionEngagement> = {};
            displaySessions.forEach(sessionOpt => {
              sessionsData[sessionOpt.value] = {
                attendance: false,
                behaviour: 'Good',
                comment: '',
              };
            });
            
            initialAllSessions[student._id] = {
              studentId: student._id,
              name,
              sessions: sessionsData,
            };
          });
          setEngagementData(initialEngagement);
          engagementDataRef.current = initialEngagement;
          setAllSessionsEngagementData(initialAllSessions);
          allSessionsEngagementDataRef.current = initialAllSessions;
          isInitialMount.current = true;
          
          // Fetch existing engagements for all students after initialization
          const fetchEngagementsForStudents = async () => {
            try {
              const response = await executeRequest('get', `/engagements/class/${filterClass}`);
              const engagements = response as ExistingEngagement[];
              
              // Update all sessions engagement data
              setAllSessionsEngagementData(prev => {
                const updated: Record<string, StudentEngagementData> = { ...prev };
                engagements.forEach(eng => {
                  const studentId = typeof eng.student === 'string' 
                    ? eng.student 
                    : (typeof eng.student === 'object' && eng.student !== null && '_id' in eng.student)
                      ? (eng.student as { _id: string })._id
                      : String(eng.student);
                  if (updated[studentId] && updated[studentId].sessions[eng.session]) {
                    updated[studentId].sessions[eng.session] = {
                      attendance: eng.attendance,
                      behaviour: eng.behaviour,
                      comment: eng.comment || '',
                      engagementId: eng._id,
                    };
                  }
                });
                allSessionsEngagementDataRef.current = updated;
                return updated;
              });
              
              // For first row: load engagement data for each student based on their selected session
              setEngagementData(prev => {
                const updated: Record<string, EngagementRow> = { ...prev };
                
                Object.keys(updated).forEach(studentId => {
                  const studentEngagement = updated[studentId];
                  const selectedSession = studentEngagement.session;
                  
                  if (selectedSession) {
                    // Find engagement for this student and session
                    const matchingEngagement = engagements.find(eng => {
                      const engStudentId = typeof eng.student === 'string' 
                        ? eng.student 
                        : (typeof eng.student === 'object' && eng.student !== null && '_id' in eng.student)
                          ? (eng.student as { _id: string })._id
                          : String(eng.student);
                      return engStudentId === studentId && eng.session === selectedSession;
                    });
                    
                    if (matchingEngagement) {
                      updated[studentId] = {
                        ...studentEngagement,
                        attendance: matchingEngagement.attendance,
                        behaviour: matchingEngagement.behaviour,
                        comment: matchingEngagement.comment || '',
                        engagementId: matchingEngagement._id,
                      };
                    }
                  }
                });
                
                engagementDataRef.current = updated;
                return updated;
              });
            } catch (error) {
              console.error('Error fetching engagements for students:', error);
            }
          };
          
          fetchEngagementsForStudents();
        } else {
          setStudents([]);
          setEngagementData({});
          setAllSessionsEngagementData({});
        }
      } catch (error) {
        console.error('Error fetching class students:', error);
        setStudents([]);
        setEngagementData({});
      }
    };

    fetchClassStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass]);

  // Fetch existing engagements when class is selected
  useEffect(() => {
    const fetchExistingEngagements = async () => {
      if (!filterClass) {
        return;
      }

      try {
        // Fetch all engagements for this class and date
        const response = await executeRequest('get', `/engagements/class/${filterClass}?date=${engagementDate}`);
        const engagements = response as ExistingEngagement[];
        
        // Update all sessions engagement data
        setAllSessionsEngagementData(prev => {
          const updated: Record<string, StudentEngagementData> = { ...prev };
          engagements.forEach(eng => {
            const studentId = typeof eng.student === 'string' 
              ? eng.student 
              : (typeof eng.student === 'object' && eng.student !== null && '_id' in eng.student)
                ? (eng.student as { _id: string })._id
                : String(eng.student);
            if (updated[studentId] && updated[studentId].sessions[eng.session]) {
              updated[studentId].sessions[eng.session] = {
                attendance: eng.attendance,
                behaviour: eng.behaviour,
                comment: eng.comment || '',
                engagementId: eng._id,
              };
            }
          });
          allSessionsEngagementDataRef.current = updated;
          return updated;
        });

        // For first row: load engagement data for each student based on their selected session
        setEngagementData(prev => {
          const updated: Record<string, EngagementRow> = { ...prev };
          
          // For each student, find their engagement for their selected session
          Object.keys(updated).forEach(studentId => {
            const studentEngagement = updated[studentId];
            const selectedSession = studentEngagement.session;
            
            if (selectedSession) {
              // Find engagement for this student and session
              const matchingEngagement = engagements.find(eng => {
                const engStudentId = typeof eng.student === 'string' 
                  ? eng.student 
                  : (typeof eng.student === 'object' && eng.student !== null && '_id' in eng.student)
                    ? (eng.student as { _id: string })._id
                    : String(eng.student);
                return engStudentId === studentId && eng.session === selectedSession;
              });
              
              if (matchingEngagement) {
                updated[studentId] = {
                  ...studentEngagement,
                  attendance: matchingEngagement.attendance,
                  behaviour: matchingEngagement.behaviour,
                  comment: matchingEngagement.comment || '',
                  engagementId: matchingEngagement._id,
                };
              }
            }
          });
          
          engagementDataRef.current = updated;
          return updated;
        });
      } catch (error) {
        console.error('Error fetching existing engagements:', error);
      }
    };

    // Only fetch if we have students loaded
    if (students.length > 0) {
      fetchExistingEngagements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass, students.length, engagementDate]);

  // Helper function to get student full name
  const getStudentName = (student: StudentData): string => {
    const firstName = student.personalInfo?.legalFirstName || '';
    const middleName = student.personalInfo?.middleName || '';
    const lastName = student.personalInfo?.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown Student';
  };

  // Auto-save function for single session
  const autoSaveEngagement = useCallback(async (studentId: string) => {
    if (!filterClassRef.current) {
      return;
    }

    const currentEngagement = engagementDataRef.current[studentId];
    if (!currentEngagement || !currentEngagement.session) {
      return;
    }

    const engagementPayload = {
      class: filterClassRef.current,
      session: currentEngagement.session,
      student: studentId,
      attendance: currentEngagement.attendance,
      behaviour: currentEngagement.behaviour,
      comment: currentEngagement.comment || '',
      engagementDate: engagementDate,
    };

    try {
      let engagementId = currentEngagement.engagementId;
      
      // If no engagementId, check if an engagement already exists for this class, student, and session
      if (!engagementId) {
        try {
          const existingEngagement = await executeRequest(
            'get',
            `/engagements/class/${filterClassRef.current}/student/${studentId}/session/${currentEngagement.session}?date=${engagementDate}`
          ) as ExistingEngagement | null;
          
          if (existingEngagement && existingEngagement._id) {
            engagementId = existingEngagement._id;
            // Update the engagementId in state and ref
            setEngagementData(prev => ({
              ...prev,
              [studentId]: {
                ...prev[studentId],
                engagementId: existingEngagement._id,
              },
            }));
            engagementDataRef.current[studentId].engagementId = existingEngagement._id;
          }
        } catch {
          // If endpoint doesn't exist or returns error, continue to create new
          console.log('No existing engagement found, will create new one');
        }
      }

      if (engagementId) {
        // Update existing engagement
        await api.patch(`/engagements/${engagementId}`, engagementPayload);
        console.log('Engagement updated successfully');
      } else {
        // Create new engagement
        const response = await api.post('/engagements', engagementPayload);
        if (response.data && response.data._id) {
          // Update engagement ID in state
          setEngagementData(prev => ({
            ...prev,
            [studentId]: {
              ...prev[studentId],
              engagementId: response.data._id,
            },
          }));
          // Update ref
          engagementDataRef.current[studentId].engagementId = response.data._id;
          console.log('Engagement created successfully');
        }
      }
    } catch (error) {
      console.error('Error auto-saving engagement:', error);
    }
  }, [executeRequest, engagementDate]);

  // Auto-save function for all sessions
  const autoSaveAllSessionsEngagement = useCallback(async (studentId: string, sessionValue: string) => {
    if (!filterClassRef.current) {
      return;
    }

    const studentData = allSessionsEngagementDataRef.current[studentId];
    if (!studentData || !studentData.sessions[sessionValue]) {
      return;
    }

    const sessionData = studentData.sessions[sessionValue];
    const engagementPayload = {
      class: filterClassRef.current,
      session: sessionValue,
      student: studentId,
      attendance: sessionData.attendance,
      behaviour: sessionData.behaviour,
      comment: sessionData.comment || '',
      engagementDate: engagementDate,
    };

    try {
      let engagementId = sessionData.engagementId;
      
      // If no engagementId, check if an engagement already exists for this class, student, and session
      if (!engagementId) {
        try {
          const existingEngagement = await executeRequest(
            'get',
            `/engagements/class/${filterClassRef.current}/student/${studentId}/session/${sessionValue}?date=${engagementDate}`
          ) as ExistingEngagement | null;
          
          if (existingEngagement && existingEngagement._id) {
            engagementId = existingEngagement._id;
            // Update the engagementId in state and ref
            setAllSessionsEngagementData(prev => ({
              ...prev,
              [studentId]: {
                ...prev[studentId],
                sessions: {
                  ...prev[studentId].sessions,
                  [sessionValue]: {
                    ...prev[studentId].sessions[sessionValue],
                    engagementId: existingEngagement._id,
                  },
                },
              },
            }));
            allSessionsEngagementDataRef.current[studentId].sessions[sessionValue].engagementId = existingEngagement._id;
          }
        } catch {
          // If endpoint doesn't exist or returns error, continue to create new
          console.log('No existing engagement found, will create new one');
        }
      }

      if (engagementId) {
        // Update existing engagement
        await api.patch(`/engagements/${engagementId}`, engagementPayload);
        console.log(`Engagement updated for session ${sessionValue}`);
      } else {
        // Create new engagement
        const response = await api.post('/engagements', engagementPayload);
        if (response.data && response.data._id) {
          // Update engagement ID in state
          setAllSessionsEngagementData(prev => ({
            ...prev,
            [studentId]: {
              ...prev[studentId],
              sessions: {
                ...prev[studentId].sessions,
                [sessionValue]: {
                  ...prev[studentId].sessions[sessionValue],
                  engagementId: response.data._id,
                },
              },
            },
          }));
          // Update ref
          allSessionsEngagementDataRef.current[studentId].sessions[sessionValue].engagementId = response.data._id;
          console.log(`Engagement created for session ${sessionValue}`);
        }
      }
    } catch (error) {
      console.error('Error auto-saving all sessions engagement:', error);
    }
  }, [executeRequest, engagementDate]);

  // Handle engagement data changes with auto-save
  const handleAttendanceChange = useCallback((studentId: string, checked: boolean) => {
    setEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        attendance: checked,
      },
    }));
    
    // Update ref immediately
    engagementDataRef.current[studentId] = {
      ...engagementDataRef.current[studentId],
      attendance: checked,
    };
    
    // Auto-save after a short delay
    if (!isInitialMount.current && filterClass && engagementDataRef.current[studentId]?.session) {
      setTimeout(() => {
        autoSaveEngagement(studentId);
      }, 500);
    }
  }, [autoSaveEngagement, filterClass]);

  const handleBehaviourChange = useCallback((studentId: string, value: string | React.ChangeEvent<HTMLSelectElement>) => {
    const behaviourValue = typeof value === 'string' ? value : value.target.value;
    setEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        behaviour: behaviourValue,
      },
    }));
    
    // Update ref immediately
    engagementDataRef.current[studentId] = {
      ...engagementDataRef.current[studentId],
      behaviour: behaviourValue,
    };
    
    // Auto-save after a short delay
    if (!isInitialMount.current && filterClass && engagementDataRef.current[studentId]?.session) {
      setTimeout(() => {
        autoSaveEngagement(studentId);
      }, 500);
    }
  }, [autoSaveEngagement, filterClass]);

  const handleCommentChange = useCallback((studentId: string, value: string) => {
    setEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: value,
      },
    }));
    
    // Update ref immediately
    engagementDataRef.current[studentId] = {
      ...engagementDataRef.current[studentId],
      comment: value,
    };
    
    // Auto-save after a short delay (debounced for text input)
    if (!isInitialMount.current && filterClass && engagementDataRef.current[studentId]?.session) {
      setTimeout(() => {
        autoSaveEngagement(studentId);
      }, 1000);
    }
  }, [autoSaveEngagement, filterClass]);

  // Handlers for all-sessions row
  const handleAllSessionsAttendanceChange = useCallback((studentId: string, sessionValue: string, checked: boolean) => {
    setAllSessionsEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        sessions: {
          ...prev[studentId].sessions,
          [sessionValue]: {
            ...prev[studentId].sessions[sessionValue],
            attendance: checked,
          },
        },
      },
    }));
    
    // Update ref immediately
    allSessionsEngagementDataRef.current[studentId].sessions[sessionValue].attendance = checked;
    
    // Auto-save after a short delay
    if (!isInitialMount.current && filterClass) {
      setTimeout(() => {
        autoSaveAllSessionsEngagement(studentId, sessionValue);
      }, 500);
    }
  }, [autoSaveAllSessionsEngagement, filterClass]);

  const handleAllSessionsBehaviourChange = useCallback((studentId: string, sessionValue: string, value: string) => {
    setAllSessionsEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        sessions: {
          ...prev[studentId].sessions,
          [sessionValue]: {
            ...prev[studentId].sessions[sessionValue],
            behaviour: value,
          },
        },
      },
    }));
    
    // Update ref immediately
    allSessionsEngagementDataRef.current[studentId].sessions[sessionValue].behaviour = value;
    
    // Auto-save after a short delay
    if (!isInitialMount.current && filterClass) {
      setTimeout(() => {
        autoSaveAllSessionsEngagement(studentId, sessionValue);
      }, 500);
    }
  }, [autoSaveAllSessionsEngagement, filterClass]);

  const handleAllSessionsCommentChange = useCallback((studentId: string, sessionValue: string, value: string) => {
    setAllSessionsEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        sessions: {
          ...prev[studentId].sessions,
          [sessionValue]: {
            ...prev[studentId].sessions[sessionValue],
            comment: value,
          },
        },
      },
    }));
    
    // Update ref immediately
    allSessionsEngagementDataRef.current[studentId].sessions[sessionValue].comment = value;
    
    // Auto-save after a short delay (debounced for text input)
    if (!isInitialMount.current && filterClass) {
      setTimeout(() => {
        autoSaveAllSessionsEngagement(studentId, sessionValue);
      }, 1000);
    }
  }, [autoSaveAllSessionsEngagement, filterClass]);

  // Mark initial mount as complete after engagements are loaded
  useEffect(() => {
    if (filterClass && students.length > 0) {
      // Set a timeout to mark initial mount as complete
      const timer = setTimeout(() => {
        isInitialMount.current = false;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [filterClass, students.length]);

  // Prepare data for DataTable - each student has two rows
  const tableData = useMemo(() => {
    const rows: Array<Record<string, unknown>> = [];
    students.forEach((student) => {
      const engagement = engagementData[student._id] || {
        studentId: student._id,
        name: getStudentName(student),
        attendance: false,
        behaviour: 'good',
        comment: '',
      };
      
      // First row - single session view
      rows.push({
        _id: `${student._id}-row1`,
        studentId: student._id,
        name: engagement.name,
        session: engagement.session || '',
        attendance: engagement.attendance,
        behaviour: engagement.behaviour,
        comment: engagement.comment,
        rowType: 'single',
        isExpanded: expandedRows.has(student._id),
      });
      
      // Second row - all sessions view (only if expanded)
      if (expandedRows.has(student._id)) {
        rows.push({
          _id: `${student._id}-row2`,
          studentId: student._id,
          name: engagement.name,
          rowType: 'all-sessions',
        });
      }
    });
    return rows;
  }, [students, engagementData, expandedRows]);

  // Handler for session change in first row
  const handleSessionChange = useCallback((studentId: string, sessionValue: string) => {
    setEngagementData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        session: sessionValue,
        // Reset engagement data when session changes
        attendance: false,
        behaviour: 'good',
        comment: '',
        engagementId: undefined,
      },
    }));
    
    // Fetch existing engagement for this student and session
    const fetchEngagementForSession = async () => {
      if (!filterClass || !sessionValue) return;
      
      try {
        const response = await executeRequest('get', `/engagements/class/${filterClass}/student/${studentId}/session/${sessionValue}?date=${engagementDate}`);
        const existingEngagement = response as ExistingEngagement | null;
        
        if (existingEngagement && existingEngagement._id) {
          setEngagementData(prev => ({
            ...prev,
            [studentId]: {
              ...prev[studentId],
              attendance: existingEngagement.attendance,
              behaviour: existingEngagement.behaviour,
              comment: existingEngagement.comment || '',
              engagementId: existingEngagement._id,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching engagement for session:', error);
      }
    };
    
    fetchEngagementForSession();
  }, [filterClass, executeRequest, engagementDate]);

  // Define columns for DataTable
  const columns = useMemo(() => [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const rowType = row.rowType as string;
        const studentId = row.studentId as string;
        const name = row.name as string;
        const isExpanded = row.isExpanded as boolean;
        
        if (rowType === 'all-sessions') {
          return <div style={{ fontWeight: 'bold' }}>{name}</div>;
        }
        
        return (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => toggleRowExpansion(studentId)}
          >
            <FontAwesomeIcon 
              icon={isExpanded ? faChevronUp : faChevronDown} 
              style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
            />
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      header: 'Session',
      accessor: 'session',
      sortable: false,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const rowType = row.rowType as string;
        const studentId = row.studentId as string;
        
        if (rowType === 'all-sessions') {
          return <div style={{ fontWeight: 'bold', fontSize: '11px' }}>All Sessions</div>;
        }
        
        const currentSession = row.session as string;
        return (
          <Select
            name={`session-${studentId}`}
            value={currentSession}
            onChange={(e) => handleSessionChange(studentId, e.target.value)}
            options={sessionOptions}
            placeholder="Select Session"
          />
        );
      },
    },
    {
      header: 'Attendance',
      accessor: 'attendance',
      sortable: false,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const rowType = row.rowType as string;
        const studentId = row.studentId as string;
        
        if (rowType === 'all-sessions') {
          const studentData = allSessionsEngagementData[studentId];
          if (!studentData) return null;
          
          return (
            <div className="all-sessions-attendance all-sessions-cell">
              {displaySessions.map(sessionOpt => (
                <div key={sessionOpt.value} className="session-row">
                  <label style={{ fontSize: '11px', marginRight: '5px' }}>{sessionOpt.label}</label>
                  <input
                    type="checkbox"
                    checked={studentData.sessions[sessionOpt.value]?.attendance || false}
                    onChange={(e) => handleAllSessionsAttendanceChange(studentId, sessionOpt.value, e.target.checked)}
                    className="attendance-checkbox"
                  />
                </div>
              ))}
            </div>
          );
        }
        
        const attendance = row.attendance as boolean;
        return (
          <input
            type="checkbox"
            checked={attendance}
            onChange={(e) => handleAttendanceChange(studentId, e.target.checked)}
            className="attendance-checkbox"
          />
        );
      },
    },
    {
      header: 'Behavior',
      accessor: 'behaviour',
      sortable: false,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const rowType = row.rowType as string;
        const studentId = row.studentId as string;
        
        if (rowType === 'all-sessions') {
          const studentData = allSessionsEngagementData[studentId];
          if (!studentData) return null;
          
          return (
            <div className="all-sessions-behaviour all-sessions-cell">
              {displaySessions.map(sessionOpt => {
                const sessionData = studentData.sessions[sessionOpt.value];
                const currentBehaviour = sessionData?.behaviour || 'Good';
                return (
                  <div key={sessionOpt.value} className="session-row">
                    <label style={{ fontSize: '11px', marginBottom: '5px', display: 'block' }}>{sessionOpt.label}</label>
                    <div className="radio-group">
                      {behaviourOptions.map(behaviourOpt => {
                        const color = getBehaviourColor(behaviourOpt.value);
                        return (
                          <label key={behaviourOpt.value} style={{ fontSize: '11px', marginRight: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="radio"
                              name={`behaviour-${studentId}-${sessionOpt.value}`}
                              value={behaviourOpt.value}
                              checked={currentBehaviour === behaviourOpt.value}
                              onChange={(e) => handleAllSessionsBehaviourChange(studentId, sessionOpt.value, e.target.value)}
                              style={{ marginRight: '3px' }}
                            />
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                display: 'inline-block',
                              }}
                            />
                            {behaviourOpt.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        
        const behaviour = row.behaviour as string;
        return (
          <BehaviorSelect
            value={behaviour}
            onChange={(value) => handleBehaviourChange(studentId, value)}
            options={behaviorSelectOptions}
            placeholder="Select Behavior"
            name={`behaviour-${studentId}`}
          />
        );
      },
    },
    {
      header: 'Comment',
      accessor: 'comment',
      sortable: false,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const rowType = row.rowType as string;
        const studentId = row.studentId as string;
        
        if (rowType === 'all-sessions') {
          const studentData = allSessionsEngagementData[studentId];
          if (!studentData) return null;
          
          return (
            <div className="all-sessions-comment all-sessions-cell">
              {displaySessions.map(sessionOpt => {
                const sessionData = studentData.sessions[sessionOpt.value];
                const comment = sessionData?.comment || '';
                return (
                  <div key={sessionOpt.value} className="session-row">
                    <label style={{ fontSize: '11px', marginBottom: '3px', display: 'block' }}>{sessionOpt.label}</label>
                    <Input
                      type="text"
                      name={`comment-${studentId}-${sessionOpt.value}`}
                      value={comment}
                      onChange={(e) => handleAllSessionsCommentChange(studentId, sessionOpt.value, e.target.value)}
                      placeholder="Enter comment..."
                    />
                  </div>
                );
              })}
            </div>
          );
        }
        
        const comment = row.comment as string;
        return (
          <Input
            type="text"
            name={`comment-${studentId}`}
            value={comment}
            onChange={(e) => handleCommentChange(studentId, e.target.value)}
            placeholder="Enter comment..."
          />
        );
      },
    },
  ], [behaviourOptions, behaviorSelectOptions, handleAttendanceChange, handleBehaviourChange, handleCommentChange, handleAllSessionsAttendanceChange, handleAllSessionsBehaviourChange, handleAllSessionsCommentChange, allSessionsEngagementData, displaySessions, handleSessionChange, sessionOptions, toggleRowExpansion]);

  return (
    <Layout>
      <div className="engagement">
        <div className="tt-main-div">
          <div className="tt-filter-div">
            <div className="engagement-date-container">
              <DateInput
                label="Engagement Date"
                name="engagementDate"
                value={engagementDate}
                onChange={(e) => setEngagementDate(e.target.value)}
                max={today}
              />
            </div>
            <FilterSec 
              secName="Students Filter"
              content={filterContent}
              retractable={true}
            />
          </div>
          <div className="tt-table-div">
            {filterClass && students.length > 0 ? (
              <DataTable
                columns={columns}
                data={tableData}
                title="Students Engagement"
                onEdit={() => {}} // No-op since we don't need edit functionality
                showActions={false}
                addButton={false}
                showSearch={false}
              />
            ) : filterClass ? (
              <div className="no-students-message">
                No students found in this class.
              </div>
            ) : (
              <div className="no-class-selected-message">
                Please select a class to view students.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Engagement;

