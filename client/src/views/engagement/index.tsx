import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Layout from '../../layouts/layout';
import './index.scss';
import FilterSec from '../../components/FilterSec/FilterSec';
import DataTable from '../../components/DataTable/DataTable';
import { Tabs } from '../../components/Tabs/Tabs';
import Select from '../../components/Select/Select';
import BehaviorSelect from '../../components/BehaviorSelect/BehaviorSelect';
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

// Marked engagement record from API (with populated class and student)
interface MarkedEngagementRecord {
  _id: string;
  class: { _id: string; location?: string; subject?: string; yeargroup?: string } | string;
  student: { _id: string; personalInfo?: { legalFirstName?: string; lastName?: string; preferredName?: string } } | string;
  session: string;
  attendance: boolean;
  behaviour: string;
  comment?: string;
  engagementDate: string;
  createdAt?: string;
}

const Engagement: React.FC = () => {
  const { executeRequest } = useApiRequest();
  const today = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<'mark' | 'marked'>('mark');
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
  const [markedEngagements, setMarkedEngagements] = useState<MarkedEngagementRecord[]>([]);
  const [markedEngagementsLoading, setMarkedEngagementsLoading] = useState(false);
  const [markedFilterDate, setMarkedFilterDate] = useState<string>('');
  const [markedFilterLocation, setMarkedFilterLocation] = useState<string>('');
  const [markedFilterSubject, setMarkedFilterSubject] = useState<string>('');
  const [markedFilterClassId, setMarkedFilterClassId] = useState<string>('');
  const [markedClassOptions, setMarkedClassOptions] = useState<DropdownOption[]>([]);
  // Universal list: students in selected class with engagement status (green/red dot)
  const [universalListStudents, setUniversalListStudents] = useState<StudentData[]>([]);
  const [universalListData, setUniversalListData] = useState<Record<string, { sessions: Record<string, SessionEngagement>; isComplete: boolean }>>({});
  const [universalListExpanded, setUniversalListExpanded] = useState<Set<string>>(new Set());
  const [universalListLoading, setUniversalListLoading] = useState(false);

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
      case 'Unmarked':
        return '#6b7280'; // gray
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
    { value: 'Unmarked', label: 'Unmarked' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Average', label: 'Average' },
    { value: 'Poor', label: 'Poor' },
  ], []);

  const behaviorSelectOptions = useMemo(() => [
    { value: 'Unmarked', label: 'Unmarked', color: '#6b7280' },
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

  // Fetch class options for Marked Engagements tab filter (same logic as Mark tab)
  useEffect(() => {
    if (!markedFilterLocation && !markedFilterSubject) {
      setMarkedClassOptions([]);
      setMarkedFilterClassId('');
      return;
    }
    const fetchMarkedClasses = async () => {
      try {
        const response = await executeRequest('get', '/classes?perPage=1000');
        if (Array.isArray(response)) {
          const filtered = response.filter((cls: ClassData) => {
            const matchesLocation = !markedFilterLocation || cls.location === markedFilterLocation;
            const matchesSubject = !markedFilterSubject || cls.subject === markedFilterSubject;
            return matchesLocation && matchesSubject;
          });
          setMarkedClassOptions(filtered.map((cls: ClassData) => ({
            label: `${cls.subject} - ${cls.yeargroup}`,
            value: cls._id,
          })));
          setMarkedFilterClassId('');
        }
      } catch {
        setMarkedClassOptions([]);
        setMarkedFilterClassId('');
      }
    };
    fetchMarkedClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markedFilterLocation, markedFilterSubject]);

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
              behaviour: 'Unmarked',
              comment: '',
            };
            
            // Initialize all sessions for this student
            const sessionsData: Record<string, SessionEngagement> = {};
            displaySessions.forEach(sessionOpt => {
              sessionsData[sessionOpt.value] = {
                attendance: false,
                behaviour: 'Unmarked',
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

  // Fetch recent marked engagements when "Marked Engagements" tab is active (no class filter)
  useEffect(() => {
    if (activeTab !== 'marked') return;
    let cancelled = false;
    setMarkedEngagementsLoading(true);
    api.get<MarkedEngagementRecord[]>('/engagements?perPage=500&sort=createdAt&order=DESC')
      .then((res) => {
        const data = res.data;
        if (!cancelled && Array.isArray(data)) setMarkedEngagements(data);
      })
      .catch(() => {
        if (!cancelled) setMarkedEngagements([]);
      })
      .finally(() => {
        if (!cancelled) setMarkedEngagementsLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  // Fetch universal list when class is selected in Marked Engagements tab (students + their engagements)
  useEffect(() => {
    if (activeTab !== 'marked' || !markedFilterClassId) {
      setUniversalListStudents([]);
      setUniversalListData({});
      setUniversalListExpanded(new Set());
      return;
    }
    let cancelled = false;
    setUniversalListLoading(true);
    const classId = markedFilterClassId;
    const dateQ = markedFilterDate ? `?date=${markedFilterDate}` : '';
    Promise.all([
      api.get<ClassData>(`/classes/${classId}`),
      api.get<MarkedEngagementRecord[]>(`/engagements/class/${classId}${dateQ}`),
    ])
      .then(([classRes, engRes]) => {
        if (cancelled) return;
        const classData = classRes.data as ClassData | undefined;
        const engagements = Array.isArray(engRes.data) ? engRes.data : [];
        const studentsList: StudentData[] = classData && Array.isArray(classData.students) ? classData.students : [];
        const studentIdsWithEngagement = new Set<string>();
        const byStudentBySession: Record<string, Record<string, { attendance: boolean; behaviour: string; comment: string }>> = {};
        const dateStr = markedFilterDate || null;
        engagements.forEach((eng: MarkedEngagementRecord) => {
          const sid = typeof eng.student === 'object' && eng.student !== null ? (eng.student as { _id: string })._id : String(eng.student);
          const sess = eng.session;
          if (!byStudentBySession[sid]) byStudentBySession[sid] = {};
          if (dateStr) {
            const engDate = eng.engagementDate ? new Date(eng.engagementDate).toISOString().split('T')[0] : '';
            if (engDate !== dateStr) return;
          }
          studentIdsWithEngagement.add(sid);
          byStudentBySession[sid][sess] = {
            attendance: eng.attendance,
            behaviour: eng.behaviour || 'Unmarked',
            comment: eng.comment || '',
          };
        });
        const displaySessionValues = displaySessions.map((s) => s.value);
        const listStudents = studentsList.filter((s) => studentIdsWithEngagement.has(s._id));
        const data: Record<string, { sessions: Record<string, SessionEngagement>; isComplete: boolean }> = {};
        listStudents.forEach((student) => {
          const sid = student._id;
          const sessMap = byStudentBySession[sid] || {};
          const sessions: Record<string, SessionEngagement> = {};
          displaySessionValues.forEach((sval) => {
            sessions[sval] = sessMap[sval]
              ? { attendance: sessMap[sval].attendance, behaviour: sessMap[sval].behaviour, comment: sessMap[sval].comment }
              : { attendance: false, behaviour: 'Unmarked', comment: '' };
          });
          const isComplete = displaySessionValues.every((sval) => sessMap[sval] != null);
          data[sid] = { sessions, isComplete };
        });
        setUniversalListStudents(listStudents);
        setUniversalListData(data);
        setUniversalListExpanded(new Set());
      })
      .catch(() => {
        if (!cancelled) {
          setUniversalListStudents([]);
          setUniversalListData({});
        }
      })
      .finally(() => {
        if (!cancelled) setUniversalListLoading(false);
      });
    return () => { cancelled = true; };
  // displaySessions is stable (useMemo with fixed sessionOptions)
  }, [activeTab, markedFilterClassId, markedFilterDate, displaySessions]);

  const toggleUniversalListExpansion = useCallback((studentId: string) => {
    setUniversalListExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }, []);

  // Read-only expanded view for universal list (marked engagements tab when class selected)
  const renderUniversalListExpandedContent = useCallback((studentId: string) => {
    const data = universalListData[studentId];
    if (!data) return null;
    return (
      <div className="engagement-expanded-div">
        <div className="engagement-expanded-header">
          <span className="engagement-expanded-col session-col">Session</span>
          <span className="engagement-expanded-col attendance-col">Attendance</span>
          <span className="engagement-expanded-col behaviour-col">Behaviour</span>
          <span className="engagement-expanded-col comment-col">Comment</span>
        </div>
        {displaySessions.map((sessionOpt) => {
          const sessionData = data.sessions[sessionOpt.value];
          return (
            <div key={sessionOpt.value} className="engagement-expanded-session-row">
              <div className="engagement-expanded-col session-col">{sessionOpt.label}</div>
              <div className="engagement-expanded-col attendance-col">{sessionData?.attendance ? 'Present' : 'Absent'}</div>
              <div className="engagement-expanded-col behaviour-col">{sessionData?.behaviour || '—'}</div>
              <div className="engagement-expanded-col comment-col">{sessionData?.comment || '—'}</div>
            </div>
          );
        })}
      </div>
    );
  }, [universalListData, displaySessions]);

  // Build expanded content (div) for a student - one row per session: session name | attendance | behaviour | comment
  const renderExpandedContent = useCallback((studentId: string) => {
    const studentData = allSessionsEngagementData[studentId];
    if (!studentData) return null;
    return (
      <div className="engagement-expanded-div">
        <div className="engagement-expanded-header">
          <span className="engagement-expanded-col session-col">Session</span>
          <span className="engagement-expanded-col attendance-col">Attendance</span>
          <span className="engagement-expanded-col behaviour-col">Behaviour</span>
          <span className="engagement-expanded-col comment-col">Comment</span>
        </div>
        {displaySessions.map(sessionOpt => {
          const sessionData = studentData.sessions[sessionOpt.value];
          const currentBehaviour = sessionData?.behaviour || 'Unmarked';
          const comment = sessionData?.comment || '';
          return (
            <div key={sessionOpt.value} className="engagement-expanded-session-row">
              <div className="engagement-expanded-col session-col">{sessionOpt.label}</div>
              <div className="engagement-expanded-col attendance-col">
                <input
                  type="checkbox"
                  checked={sessionData?.attendance || false}
                  onChange={(e) => handleAllSessionsAttendanceChange(studentId, sessionOpt.value, e.target.checked)}
                  className="attendance-checkbox"
                />
              </div>
              <div className="engagement-expanded-col behaviour-col">
                <div className="radio-group radio-group-inline">
                  {behaviourOptions.map(behaviourOpt => {
                    const color = getBehaviourColor(behaviourOpt.value);
                    return (
                      <label key={behaviourOpt.value} className="radio-label-inline">
                        <input
                          type="radio"
                          name={`behaviour-${studentId}-${sessionOpt.value}`}
                          value={behaviourOpt.value}
                          checked={currentBehaviour === behaviourOpt.value}
                          onChange={(e) => handleAllSessionsBehaviourChange(studentId, sessionOpt.value, e.target.value)}
                        />
                        <span className="radio-dot" style={{ backgroundColor: color }} />
                        {behaviourOpt.label}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="engagement-expanded-col comment-col">
                <textarea
                  name={`comment-${studentId}-${sessionOpt.value}`}
                  value={comment}
                  onChange={(e) => handleAllSessionsCommentChange(studentId, sessionOpt.value, e.target.value)}
                  placeholder="Enter comment..."
                  className="engagement-comment-textarea"
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [allSessionsEngagementData, displaySessions, behaviourOptions, handleAllSessionsAttendanceChange, handleAllSessionsBehaviourChange, handleAllSessionsCommentChange]);

  // Prepare data for DataTable - one row per student; expanded content in a div
  const tableData = useMemo(() => {
    return students.map((student) => {
      const engagement = engagementData[student._id] || {
        studentId: student._id,
        name: getStudentName(student),
        attendance: false,
        behaviour: 'good',
        comment: '',
      };
      const isExpanded = expandedRows.has(student._id);
      return {
        _id: student._id,
        studentId: student._id,
        name: engagement.name,
        session: engagement.session || '',
        attendance: engagement.attendance,
        behaviour: engagement.behaviour,
        comment: engagement.comment,
        isExpanded,
        expandedContent: isExpanded ? renderExpandedContent(student._id) : undefined,
      };
    });
  }, [students, engagementData, expandedRows, renderExpandedContent]);

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
        const studentId = row.studentId as string;
        const name = row.name as string;
        const isExpanded = row.isExpanded as boolean;
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
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
        const studentId = row.studentId as string;
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
        const studentId = row.studentId as string;
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
        const studentId = row.studentId as string;
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
        const studentId = row.studentId as string;
        const comment = row.comment as string;
        return (
          <textarea
            name={`comment-${studentId}`}
            value={comment}
            onChange={(e) => handleCommentChange(studentId, e.target.value)}
            placeholder="Enter comment..."
            className="engagement-comment-textarea"
            rows={3}
          />
        );
      },
    },
  ], [behaviorSelectOptions, handleAttendanceChange, handleBehaviourChange, handleCommentChange, handleSessionChange, sessionOptions, toggleRowExpansion]);

  // Marked engagements table: columns and data
  const markedEngagementsColumns = useMemo(() => [
    { header: 'Date', accessor: 'engagementDateFormatted', sortable: true, type: 'string' as const },
    { header: 'Class', accessor: 'classDisplay', sortable: true, type: 'string' as const },
    { header: 'Student', accessor: 'studentDisplay', sortable: true, type: 'string' as const },
    { header: 'Session', accessor: 'session', sortable: true, type: 'string' as const },
    { header: 'Attendance', accessor: 'attendanceDisplay', sortable: false, type: 'string' as const },
    { header: 'Behaviour', accessor: 'behaviour', sortable: true, type: 'string' as const },
    { header: 'Comment', accessor: 'comment', sortable: false, type: 'string' as const },
  ], []);

  const markedEngagementsTableData = useMemo(() => {
    const classIdFromEng = (eng: MarkedEngagementRecord) =>
      typeof eng.class === 'object' && eng.class !== null && eng.class && typeof (eng.class as { _id?: string })._id === 'string'
        ? (eng.class as { _id: string })._id
        : typeof eng.class === 'string' ? eng.class : '';
    const toDateStr = (d: string | undefined) => (d ? new Date(d).toISOString().split('T')[0] : '');

    const filtered = markedEngagements.filter((eng) => {
      if (markedFilterDate) {
        const engDateStr = toDateStr(eng.engagementDate || eng.createdAt);
        if (engDateStr !== markedFilterDate) return false;
      }
      const cId = classIdFromEng(eng);
      if (markedFilterClassId && cId !== markedFilterClassId) return false;
      const classObj = typeof eng.class === 'object' && eng.class !== null
        ? eng.class as { location?: string; subject?: string }
        : null;
      if (markedFilterLocation && classObj?.location !== markedFilterLocation) return false;
      if (markedFilterSubject && classObj?.subject !== markedFilterSubject) return false;
      return true;
    });

    return filtered.map((eng) => {
      const classObj = typeof eng.class === 'object' && eng.class !== null
        ? eng.class as { location?: string; subject?: string; yeargroup?: string }
        : null;
      const studentObj = typeof eng.student === 'object' && eng.student !== null
        ? eng.student as { personalInfo?: { legalFirstName?: string; lastName?: string; preferredName?: string } }
        : null;
      const classDisplay = classObj
        ? [classObj.location, classObj.subject, classObj.yeargroup].filter(Boolean).join(' · ') || '—'
        : '—';
      const studentDisplay = studentObj?.personalInfo
        ? [studentObj.personalInfo.legalFirstName, studentObj.personalInfo.lastName].filter(Boolean).join(' ') ||
          studentObj.personalInfo.preferredName || '—'
        : '—';
      const date = eng.engagementDate || eng.createdAt;
      const engagementDateFormatted = date
        ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
      return {
        _id: eng._id,
        engagementDateFormatted,
        classDisplay,
        studentDisplay,
        session: eng.session || '—',
        attendanceDisplay: eng.attendance ? 'Present' : 'Absent',
        behaviour: eng.behaviour || '—',
        comment: eng.comment || '—',
      };
    });
  }, [markedEngagements, markedFilterDate, markedFilterLocation, markedFilterSubject, markedFilterClassId]);

  // Universal list table (students with engagements when class filter is set) – same style as Mark Engagement tab
  const universalListColumns = useMemo(() => [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const studentId = row.studentId as string;
        const name = row.name as string;
        const isExpanded = row.isExpanded as boolean;
        const isComplete = row.isComplete as boolean;
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => toggleUniversalListExpansion(studentId)}
          >
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
            />
            <span
              className="engagement-status-dot"
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: isComplete ? '#22c55e' : '#ef4444',
              }}
              title={isComplete ? 'All sessions marked' : 'Partially marked'}
            />
            <span>{name}</span>
          </div>
        );
      },
    },
    { header: 'Session', accessor: 'session', sortable: false, type: 'string' as const },
    { header: 'Attendance', accessor: 'attendance', sortable: false, type: 'string' as const },
    { header: 'Behaviour', accessor: 'behaviour', sortable: false, type: 'string' as const },
    { header: 'Comment', accessor: 'comment', sortable: false, type: 'string' as const },
  ], [toggleUniversalListExpansion]);

  const universalListTableData = useMemo(() => {
    const firstSession = displaySessions[0];
    return universalListStudents.map((student) => {
      const studentId = student._id;
      const data = universalListData[studentId];
      const isComplete = data?.isComplete ?? false;
      const isExpanded = universalListExpanded.has(studentId);
      const firstSessionData = firstSession && data?.sessions?.[firstSession.value];
      return {
        _id: studentId,
        studentId,
        name: getStudentName(student),
        session: firstSession ? firstSession.label : '—',
        attendance: firstSessionData ? (firstSessionData.attendance ? 'Present' : 'Absent') : '—',
        behaviour: firstSessionData?.behaviour ?? '—',
        comment: firstSessionData?.comment ?? '—',
        isExpanded,
        isComplete,
        expandedContent: isExpanded ? renderUniversalListExpandedContent(studentId) : undefined,
      };
    });
  }, [universalListStudents, universalListData, universalListExpanded, renderUniversalListExpandedContent, displaySessions]);

  const markEngagementContent = (
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
            onEdit={() => {}}
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
  );

  const markedFilterContent = (
    <div className="inputs-div-tt">
      <div className="input-div-engagement">
        <DateInput
          label="Date"
          name="markedFilterDate"
          value={markedFilterDate}
          onChange={(e) => setMarkedFilterDate(e.target.value)}
        />
      </div>
      <div className="input-div-engagement">
        <Select
          label="Location"
          name="markedFilterLocation"
          value={markedFilterLocation}
          onChange={(e) => setMarkedFilterLocation(e.target.value)}
          options={locationOptions}
          placeholder="All Locations"
          icon={locationIcon}
        />
      </div>
      <div className="input-div-engagement">
        <Select
          label="Subject"
          name="markedFilterSubject"
          value={markedFilterSubject}
          onChange={(e) => setMarkedFilterSubject(e.target.value)}
          options={subjectOptions}
          placeholder="All Subjects"
          icon={Subject}
        />
      </div>
      <div className="input-div-engagement">
        <Select
          label="Class/Provision"
          name="markedFilterClass"
          value={markedFilterClassId}
          onChange={(e) => setMarkedFilterClassId(e.target.value)}
          options={markedClassOptions}
          placeholder="All Classes"
          icon={Class}
          disabled={markedClassOptions.length === 0}
        />
      </div>
    </div>
  );

  const showUniversalList = Boolean(markedFilterClassId);

  const markedEngagementsContent = (
    <div className="tt-main-div marked-engagements-tab">
      <div className="tt-filter-div">
        <FilterSec
          secName="Filter engagements"
          content={markedFilterContent}
          retractable={true}
        />
      </div>
      <div className="tt-table-div">
        {showUniversalList ? (
          universalListLoading ? (
            <div className="marked-engagements-loading">Loading class engagements...</div>
          ) : universalListTableData.length === 0 ? (
            <div className="no-students-message">
              No marked engagements for this class{markedFilterDate ? ` on ${markedFilterDate}` : ''}. Select a class and date to see students with at least one session marked.
            </div>
          ) : (
            <DataTable
              columns={universalListColumns}
              data={universalListTableData}
              title="Class engagement list"
              onEdit={() => {}}
              showActions={false}
              addButton={false}
              showSearch={false}
            />
          )
        ) : markedEngagementsLoading ? (
          <div className="marked-engagements-loading">Loading marked engagements...</div>
        ) : (
          <DataTable
            columns={markedEngagementsColumns}
            data={markedEngagementsTableData}
            title="Marked Engagements"
            onEdit={() => {}}
            showActions={false}
            addButton={false}
            showSearch={true}
          />
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'mark', label: 'Mark Engagement', content: markEngagementContent },
    { id: 'marked', label: 'Marked Engagements', content: markedEngagementsContent },
  ];

  return (
    <Layout>
      <div className="engagement">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as 'mark' | 'marked')} />
      </div>
    </Layout>
  );
};

export default Engagement;

