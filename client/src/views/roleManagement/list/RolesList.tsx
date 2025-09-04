import React from 'react';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';

const RolesList = () => {
  const [roles, setRoles] = React.useState([]);
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const columns = [
    { header: '#', accessor: 'num', sortable: true, type: 'number' as const },
    { header: 'Name', accessor: 'name', sortable: true, type: 'string' as const },
    { header: 'Description', accessor: 'description', sortable: true, type: 'string' as const },
    { header: 'Created', accessor: 'createdAt', sortable: true, type: 'date' as const },
  ];
  const { executeRequest } = useApiRequest<any>();

  const fetchRoles = async () => {
    try {
      const response = await executeRequest('get', `/roles?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
      setRoles(response);
    } catch (err: any) {
      console.log(err);
    }
  };
  const handleDelete = async (id:any) => {
    console.log('deleting: ',id);
    const response = await executeRequest('delete', `/roles/${id._id}`);
    console.log(response);
    fetchRoles();
  }
  const handleSort = async (key: string, direction: 'ASC' | 'DESC') => {
    console.log('sorting: ', key, direction);
    setSort(key);
    setOrder(direction);
    fetchRoles();
  }
  const handleSearch = async (searchTerm: string) => {
    console.log('searching: ', searchTerm);
    setSearch(searchTerm);
    setPage(1);
    fetchRoles();
  }
  const handleAdd = () => {
    window.location.href = '/roles/add';
  }
  const handleEdit = (row: any) => {
    console.log('editing: ', row);
    window.location.href = `/roles/edit/${row._id}`;
  }
  React.useEffect(() => {
    fetchRoles();
  }, []);
  
 
  return (
    <Layout>
      <div className="roles-list">
        <div className="roles-list-content">
          <DataTable
              columns={columns}
              data={roles}
              title="All Roles"
              onDelete={handleDelete}
              onSort={handleSort}
              onSearch={handleSearch}
              PerPage={setPerPage}
              onAdd={handleAdd}
              onEdit={handleEdit}
            />
        </div>
      </div>
    </Layout>
  );
};

export default RolesList;
