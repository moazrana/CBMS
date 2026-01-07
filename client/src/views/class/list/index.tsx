import React from 'react';
import { useNavigate } from 'react-router-dom';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';

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

const ClassList = () => {
  const [classes, setClasses] = React.useState<Class[]>([]);
  const { executeRequest } = useApiRequest<Class[]>();
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const fetchClasses = async () => {
    try {
      const response = await executeRequest('get', `/classes?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
      console.log({ ...response });
      setClasses(response);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const classItem = row as unknown as Class;
    try {
      await executeRequest('delete', `/classes/${classItem._id}`);
      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  const handleSort = async (key: string, direction: 'ASC' | 'DESC') => {
    console.log('sorting: ', key, direction);
    setSort(key);
    setOrder(direction);
    await fetchClasses();
  };

  const handleSearch = async (searchTerm: string) => {
    console.log('searching: ', searchTerm);
    setSearch(searchTerm);
    setPage(1);
    await fetchClasses();
  };

  const navigate = useNavigate();

  const onAdd = async () => {
    navigate('/classes/add');
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const classItem = row as unknown as Class;
    navigate(`/classes/edit/${classItem._id}`);
  };

  const handleView = async (row: Record<string, unknown>) => {
    const classItem = row as unknown as Class;
    try {
      const response = await executeRequest('get', `/classes/${classItem._id}`);
      console.log('Class details:', response);
      // You can add a view modal/popup here if needed
    } catch (error) {
      console.error('Error fetching class details:', error);
      alert('Failed to load class details');
    }
  };

  const handleCustomAction = (row: Record<string, unknown>) => {
    const classItem = row as unknown as Class;
    navigate(`/classes/${classItem._id}/allocate`);
  };

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

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--';
    }
  };

  React.useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format class data for display
  const formattedClasses = classes.map((classItem) => {
    const studentCount = classItem.students?.length || 0;
    const studentNames = classItem.students?.map(student => {
      if (student.personalInfo?.preferredName) {
        return student.personalInfo.preferredName;
      }
      if (student.personalInfo?.legalFirstName && student.personalInfo?.lastName) {
        return `${student.personalInfo.legalFirstName} ${student.personalInfo.lastName}`;
      }
      return 'N/A';
    }).join(', ') || 'No students';
    
    return {
      ...classItem,
      location: classItem.location || '--',
      subject: classItem.subject || '--',
      yeargroup: classItem.yeargroup || '--',
      fromDate: formatDate(classItem.fromDate),
      toDate: formatDate(classItem.toDate),
      studentCount: studentCount.toString(),
      studentNames: studentCount > 0 ? studentNames : 'No students',
      createdAt: formatDateTime(classItem.createdAt),
      id: classItem._id,
    };
  });

  const columns = [
    { header: 'Location', accessor: 'location', sortable: true, type: 'string' as const },
    { header: 'Subject', accessor: 'subject', sortable: true, type: 'string' as const },
    { header: 'Year Group', accessor: 'yeargroup', sortable: true, type: 'string' as const },
    { header: 'From Date', accessor: 'fromDate', sortable: true, type: 'string' as const },
    { header: 'To Date', accessor: 'toDate', sortable: true, type: 'string' as const },
    { header: 'Students', accessor: 'studentCount', sortable: true, type: 'string' as const },
    { header: 'Created At', accessor: 'createdAt', sortable: true, type: 'string' as const },
  ];

  return (
    <Layout>
      <div className="class-list">
        <div className="class-list-content">
          <DataTable
            columns={columns}
            data={formattedClasses}
            title="All Classes"
            onDelete={handleDelete}
            onSort={handleSort}
            onSearch={handleSearch}
            PerPage={setPerPage}
            onEdit={handleEdit}
            onView={handleView}
            onAdd={onAdd}
            addPermission='create_class'
            customActions={[
              {
                icon: faUsers,
                onClick: handleCustomAction,
                title: 'Manage Students',
                id: 'manage-students'
              }
            ]}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClassList;

