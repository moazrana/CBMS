import React, { useState } from 'react';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';
import Popup from '../../../components/Popup/Popup';
import Input from '../../../components/input/Input';
import Select from '../../../components/Select/Select';

interface Permission {
  _id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role | string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface RoleOption {
  value: string;
  label: string;
}

const UserList = () => {
  // Sample data - replace with actual API call
  const [users, setUsers] = React.useState<User[]>([]);
  const { executeRequest} = useApiRequest<User[]>();
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const fetchUsers = async () => {
   const response = await executeRequest('get', `/users?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
   console.log({...response});
   response.forEach((user: User) => {
    if (user.role && typeof user.role === 'object' && 'name' in user.role) {
      user.role = user.role.name;
    }
   });
   setUsers(response);
  };

  const handleDelete = async (row: Record<string, any>) => {
    const user = row as User;
    await executeRequest('delete', `/users/${user._id}`).then(fetchUsers);
    
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
  const onAdd = async () => {
    await fetchRoles();
    console.log('adding: ');
    setIsPopupOpen(true);
  }
  const handleEdit = (row: Record<string, any>) => {
    const user = row as User;
    console.log('editing: ', user);
  };
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
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const handleSubmit = async () => {
    console.log('form submitted');
    setIsPopupOpen(false);
  }
  const [userData,setUserData]=useState<UserData>({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  const [roles,setRoles]=useState<RoleOption[]>([]);
  const fetchRoles = async () => {
    const response = await executeRequest('get', `/roles`);
    const roleOptions = response.map((role: Role) => ({
      value: role.name,
      label: role.name
    }));
    setRoles(roleOptions);
   };

   

  return (
    <>
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
              onEdit={handleEdit}
              onAdd={onAdd}
            />
          </div>
        </div>
      </Layout>
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Add User"
        width="600px"
        confirmText='Add User'
        cancelText='Cancel'
        onConfirm={() => handleSubmit()}
        >
          <form >
              {/* Your form fields go here */}
              <Input label='Name' name='name' value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
              <Input label='Email' name='email' value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} />
              <Select 
                label='Role' 
                name='role' 
                value={userData.role} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserData({...userData, role: e.target.value})} 
                options={roles}
                placeholder='Select Role'
              />
              <Input type='password' label='Password' name='password' value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} />
              
          </form>
      </Popup>
    </>
  );
};

export default UserList;
