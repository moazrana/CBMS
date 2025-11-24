import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';

interface Staff {
  _id: string;
  name?: string;
  email?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    preferredName?: string;
    phoneWork?: string;
    phoneMobile?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const StaffList = () => {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const { executeRequest } = useApiRequest<Staff[]>();
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const fetchStaff = async () => {
    try {
      const response = await executeRequest('get', `/staff?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
      console.log({ ...response });
      setStaff(response);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const staffMember = row as unknown as Staff;
    try {
      await executeRequest('delete', `/staff/${staffMember._id}`);
      await fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const handleSort = async (key: string, direction: 'ASC' | 'DESC') => {
    console.log('sorting: ', key, direction);
    setSort(key);
    setOrder(direction);
    await fetchStaff();
  };

  const handleSearch = async (searchTerm: string) => {
    console.log('searching: ', searchTerm);
    setSearch(searchTerm);
    setPage(1);
    await fetchStaff();
  };

  const navigate = useNavigate();

  const onAdd = async () => {
    navigate('/staff/add');
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const staffMember = row as unknown as Staff;
    navigate(`/staff/edit/${staffMember._id}`);
  };

  React.useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format staff data for display
  const formattedStaff = staff.map((member) => {
    const profile = member.profile || {};
    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    const preferredName = profile.preferredName || '';
    const displayName = preferredName || `${firstName} ${lastName}`.trim() || member.name || 'N/A';
    const phone = profile.phoneMobile || profile.phoneWork || 'N/A';
    
    return {
      ...member,
      name: displayName,
      phoneNumber: phone,
      id: member._id,
    };
  });

  const columns = [
    { header: 'ID', accessor: 'id', sortable: true, type: 'number' as const },
    { header: 'Name', accessor: 'name', sortable: true, type: 'string' as const },
    { header: 'Email', accessor: 'email', sortable: true, type: 'string' as const },
    { header: 'Phone', accessor: 'phoneNumber', sortable: true, type: 'string' as const },
    { header: 'Created', accessor: 'createdAt', sortable: true, type: 'date' as const },
    { header: 'Updated', accessor: 'updatedAt', sortable: true, type: 'date' as const }
  ];

  return (
    <>
      <Layout>
        <div className="staff-list">
          <div className="staff-list-content">
            <DataTable
              columns={columns}
              data={formattedStaff}
              title="All Staff"
              onDelete={handleDelete}
              onSort={handleSort}
              onSearch={handleSearch}
              PerPage={setPerPage}
              onEdit={handleEdit}
              onAdd={onAdd}
              addPermission='create_staff'
            />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default StaffList;

