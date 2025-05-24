import React from 'react';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';

const UserList = () => {
  // Sample data - replace with actual API call
  const [users, setUsers] = React.useState([]);
  const { executeRequest, error: apiError } = useApiRequest<any>();
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const fetchUsers = async () => {
   const response = await executeRequest('get', `/users?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
   response.forEach((user: any) => {
    if (user.role) {
      user.role = user.role.name;
    }
   });
   setUsers(response);
  };

  const handleDelete = async (id:any) => {
    console.log('deleting: ',id);
    const response = await executeRequest('delete', `/users/${id._id}`);
    console.log(response);
    fetchUsers();
  }
  const handleSort = async (key: string, direction: 'ASC' | 'DESC') => {
    console.log('sorting: ', key, direction);
    setSort(key);
    setOrder(direction);
    fetchUsers();
  }
  const handleSearch = async (searchTerm: string) => {
    console.log('searching: ', searchTerm);
    setSearch(searchTerm);
    setPage(1);
    fetchUsers();
  }
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id', sortable: true, type: 'number' as const },
    { header: 'Name', accessor: 'name', sortable: true, type: 'string' as const },
    { header: 'Email', accessor: 'email', sortable: true, type: 'string' as const },
    { header: 'Role', accessor: 'role', sortable: true, type: 'string' as const },
    { header: 'Created', accessor: 'createdAt', sortable: true, type: 'date' as const },
    { header: 'Updated', accessor: 'updatedAt', sortable: true, type: 'date' as const }
  ];

  return (
    <Layout>
      <div className="users-list">
        <div className="users-list-content">
          <DataTable
            columns={columns}
            data={users}
            title="All Users"
            onDelete={handleDelete}
            onSort={handleSort}
            onSearch={handleSearch}
            PerPage={setPerPage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default UserList;
