import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import SearchableSelect from '../../../components/SearchableSelect/SearchableSelect';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import SidebarPopup from '../../../components/SidebarPopup/SidebarPopup';
import StudentView, { StudentViewProps } from '../view/StudentView';
import { DropdownOption } from '../../../types/DropDownOption';

interface Student {
  _id: string;
  personalInfo?: {
    legalFirstName?: string;
    middleName?: string;
    lastName?: string;
    preferredName?: string;
    adno?: string;
    upn?: string;
    sex?: 'Male' | 'Female' | 'Unknown';
    dateOfBirth?: string;
    yearGroup?: string;
    email?: string;
    mobile?: string;
    admissionDate?: string;
    ethnicity?: string;
    photo?: string;
    location?: string;
  };
  parents?: Array<{ mobile?: string; email?: string; homePhone?: string }>;
  emergencyContacts?: Array<{ mobile?: string; email?: string; dayPhone?: string; eveningPhone?: string }>;
  medical?: { ehcp?: { hasEHCP?: boolean } };
  behaviour?: unknown;
  createdAt: string;
  updatedAt: string;
  classSubjects?: string;
}

const StudentList = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const { executeRequest } = useApiRequest<Student[]>();
  const [tableLoading, setTableLoading] = React.useState(false);
  const [filterLoading, setFilterLoading] = React.useState(false);
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [viewingStudent, setViewingStudent] = React.useState<Student | null>(null);
  const [selectedStudentFilter, setSelectedStudentFilter] = React.useState<string>('');
  const [studentFilterOptions, setStudentFilterOptions] = React.useState<DropdownOption[]>([]);
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);

  const fetchStudents = async () => {
    setTableLoading(true);
    try {
      const res = await api.get(`/students?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const student = row as unknown as Student;
    try {
      await executeRequest('delete', `/students/${student._id}`);
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleSort = async (key: string, direction: 'ASC' | 'DESC') => {
    console.log('sorting: ', key, direction);
    setSort(key);
    setOrder(direction);
    await fetchStudents();
  };

  const handleSearch = async (searchTerm: string) => {
    console.log('searching: ', searchTerm);
    setSearch(searchTerm);
    setPage(1);
    await fetchStudents();
  };

  const navigate = useNavigate();

  const onAdd = async () => {
    navigate('/students/add');
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const student = row as unknown as Student;
    navigate(`/students/edit/${student._id}`);
  };

  const calculateAge = (dateOfBirth: string | undefined): string => {
    if (!dateOfBirth) return '--';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    } catch {
      return '--';
    }
  };

  React.useEffect(() => {
    fetchStudents();
    fetchAllStudentsForFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllStudentsForFilter = async () => {
    setFilterLoading(true);
    try {
      const res = await api.get('/students?perPage=1000');
      const list: Student[] = Array.isArray(res.data) ? res.data : [];
      setAllStudents(list);
      const options: DropdownOption[] = list.map((s) => {
        const p = s.personalInfo ?? {};
        const name = [p.legalFirstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim();
        return { value: s._id, label: name || s._id };
      });
      setStudentFilterOptions(options);
    } catch (error) {
      console.error('Error fetching students for filter:', error);
    } finally {
      setFilterLoading(false);
    }
  };

  // Format contact: student email/mobile, or first parent/emergency contact
  const getContact = (s: Student): string => {
    const p = s.personalInfo;
    if (p?.mobile?.trim()) return p.mobile.trim();
    if (p?.email?.trim()) return p.email.trim();
    const parent = s.parents?.[0];
    if (parent?.mobile?.trim()) return parent.mobile.trim();
    if (parent?.email?.trim()) return parent.email.trim();
    if (parent?.homePhone?.trim()) return parent.homePhone.trim();
    const ec = s.emergencyContacts?.[0];
    if (ec?.mobile?.trim()) return ec.mobile.trim();
    if (ec?.dayPhone?.trim()) return ec.dayPhone.trim();
    if (ec?.eveningPhone?.trim()) return ec.eveningPhone.trim();
    if (ec?.email?.trim()) return ec.email.trim();
    return '—';
  };

  // Format student data for display
  const formattedStudents = students.map((student) => {
    const personalInfo = student.personalInfo || {};
    const firstName = personalInfo.legalFirstName || '';
    const lastName = personalInfo.lastName || '';
    const studentName = `${firstName} ${lastName}`.trim() || 'N/A';
    const yearGroup = personalInfo.yearGroup || '--';
    const sex = personalInfo.sex || '--';
    const dateOfBirth = personalInfo.dateOfBirth || null;
    const age = calculateAge(personalInfo.dateOfBirth);
    const subject = (student as Student & { classSubjects?: string }).classSubjects?.trim() || '—';
    const location = personalInfo.location?.trim() || '—';
    const contact = getContact(student);
    const hasEHCP = student.medical?.ehcp?.hasEHCP === true;

    return {
      ...student,
      studentName,
      yearGroup,
      sex,
      dateOfBirth,
      age,
      subject,
      location,
      contact,
      hasEHCP,
      id: student._id,
    };
  });

  // Filter by selected student
  const filteredStudents = selectedStudentFilter
    ? formattedStudents.filter((s) => s._id === selectedStudentFilter)
    : formattedStudents;

  const columns = [
    { header: 'Student Name', accessor: 'studentName', sortable: true, type: 'string' as const },
    { header: 'Year Group', accessor: 'yearGroup', sortable: true, type: 'string' as const },
    { header: 'Sex', accessor: 'sex', sortable: true, type: 'string' as const },
    { header: 'Date of Birth', accessor: 'dateOfBirth', sortable: true, type: 'date' as const },
    { header: 'Age', accessor: 'age', sortable: true, type: 'string' as const },
    { header: 'Subject', accessor: 'subject', sortable: false, type: 'string' as const },
    { header: 'Location', accessor: 'location', sortable: true, type: 'string' as const },
    { header: 'Contact', accessor: 'contact', sortable: false, type: 'string' as const },
    {
      header: 'EHCP',
      accessor: 'hasEHCP',
      sortable: false,
      type: 'template' as const,
      template: (row: Record<string, unknown>) => {
        const hasEHCP = row.hasEHCP === true;
        return (
          <span title={hasEHCP ? 'Has EHCP' : 'No EHCP'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {hasEHCP ? (
              <FontAwesomeIcon icon={faCheck} style={{ color: '#22c55e' }} />
            ) : (
              <FontAwesomeIcon icon={faTimes} style={{ color: '#ef4444' }} />
            )}
          </span>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="student-list">
        <div className="student-list-content">
          <div style={{ marginBottom: '20px', padding: '0 20px' }}>
            <SearchableSelect
              label="Filter by Student"
              name="student-filter"
              value={selectedStudentFilter}
              onChange={(v) => setSelectedStudentFilter(String(v))}
              options={studentFilterOptions}
              loading={filterLoading}
              onSearch={(term) => {
                const trimmed = term.trim().toLowerCase();
                const base: DropdownOption[] = allStudents.map((s) => {
                  const p = s.personalInfo ?? {};
                  const name = [p.legalFirstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim();
                  return { value: s._id, label: name || s._id };
                });

                if (!trimmed) {
                  setStudentFilterOptions(base);
                  return;
                }

                const filtered = base.filter((o) => {
                  const l = o.label.toLowerCase();
                  return l.includes(trimmed) || String(o.value).includes(trimmed);
                });

                // Keep selected student visible
                if (selectedStudentFilter) {
                  const selected = base.find((o) => o.value === selectedStudentFilter);
                  if (selected && !filtered.some((o) => o.value === selected.value)) {
                    setStudentFilterOptions([selected, ...filtered]);
                    return;
                  }
                }

                setStudentFilterOptions(filtered);
              }}
              placeholder="Search student..."
            />
          </div>
          <DataTable
            columns={columns}
            data={filteredStudents}
            title="All Students"
            onDelete={handleDelete}
            onSort={handleSort}
            onSearch={handleSearch}
            PerPage={setPerPage}
            onEdit={handleEdit}
            onAdd={onAdd}
            addPermission='create_student'
            loading={tableLoading}
          />
        </div>
      </div>
      <SidebarPopup
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingStudent(null);
        }}
        title={viewingStudent?.personalInfo?.preferredName ||
          `${viewingStudent?.personalInfo?.legalFirstName || ''} ${viewingStudent?.personalInfo?.lastName || ''}`.trim() ||
          'Student Details'}
        message="Student Information"
        width="600px"
        link={viewingStudent?._id ? `/students/edit/${viewingStudent._id}` : undefined}
      >
        {viewingStudent && <StudentView studentData={viewingStudent as unknown as StudentViewProps['studentData']} />}
      </SidebarPopup>
    </Layout>
  );
};

export default StudentList;

