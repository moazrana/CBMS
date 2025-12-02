import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';
import SidebarPopup from '../../../components/SidebarPopup/SidebarPopup';
import StudentView, { StudentViewProps } from '../view/StudentView';

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
  };
  parents?: Array<unknown>;
  emergencyContacts?: Array<unknown>;
  medical?: unknown;
  behaviour?: unknown;
  createdAt: string;
  updatedAt: string;
}

const StudentList = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const { executeRequest } = useApiRequest<Student[]>();
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [viewingStudent, setViewingStudent] = React.useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      const response = await executeRequest('get', `/students?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
      console.log({ ...response });
      setStudents(response);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const handleView = async (row: Record<string, unknown>) => {
    const student = row as unknown as Student;
    try {
      const response = await executeRequest('get', `/students/${student._id}`);
      setViewingStudent(response as Student);
      setIsViewOpen(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to load student details');
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format student data for display
  const formattedStudents = students.map((student) => {
    const personalInfo = student.personalInfo || {};
    const firstName = personalInfo.legalFirstName || '';
    const lastName = personalInfo.lastName || '';
    const studentName = `${firstName} ${lastName}`.trim() || 'N/A';
    const preferredName = personalInfo.preferredName || '--';
    const yearGroup = personalInfo.yearGroup || '--';
    const form = '--'; // Not in schema yet
    const adno = personalInfo.adno || '--';
    const sex = personalInfo.sex || '--';
    const upn = personalInfo.upn || '--';
    const dateOfBirth = personalInfo.dateOfBirth || null;
    const fsnEligibility = '--'; // Not in schema yet
    const age = calculateAge(personalInfo.dateOfBirth);
    
    return {
      ...student,
      studentName,
      preferredName,
      yearGroup,
      form,
      adno,
      sex,
      upn,
      dateOfBirth,
      fsnEligibility,
      age,
      id: student._id,
    };
  });

  const columns = [
    { header: 'Student Name', accessor: 'studentName', sortable: true, type: 'string' as const },
    { header: 'Preferred Name', accessor: 'preferredName', sortable: true, type: 'string' as const },
    { header: 'Year Group', accessor: 'yearGroup', sortable: true, type: 'string' as const },
    { header: 'Form', accessor: 'form', sortable: true, type: 'string' as const },
    { header: 'ADNO', accessor: 'adno', sortable: true, type: 'string' as const },
    { header: 'Sex', accessor: 'sex', sortable: true, type: 'string' as const },
    { header: 'UPN', accessor: 'upn', sortable: true, type: 'string' as const },
    { header: 'Date of Birth', accessor: 'dateOfBirth', sortable: true, type: 'date' as const },
    { header: 'FSN Eligibility', accessor: 'fsnEligibility', sortable: true, type: 'string' as const },
    { header: 'Age', accessor: 'age', sortable: true, type: 'string' as const },
  ];

  return (
    <Layout>
      <div className="student-list">
        <div className="student-list-content">
          <DataTable
            columns={columns}
            data={formattedStudents}
            title="All Students"
            onDelete={handleDelete}
            onSort={handleSort}
            onSearch={handleSearch}
            PerPage={setPerPage}
            onEdit={handleEdit}
            onView={handleView}
            onAdd={onAdd}
            addPermission='create_student'
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

