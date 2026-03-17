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
  pin: string;
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
    setEditingUserId(null);
    setIsEditMode(false);
    setUserData({
      name: '',
      email: '',
      role: '',
      password: '',
      pin: '',
    });
    setIsPopupOpen(true);
  }
  const handleEdit = (row: Record<string, any>) => {
    const user = row as User;
    console.log('editing: ', user);
    fetchRoles().then(() => {
      const roleName =
        user.role && typeof user.role === 'object' && 'name' in user.role
          ? (user.role as any).name
          : String(user.role ?? '');
      setEditingUserId(user._id);
      setIsEditMode(true);
      setUserData({
        name: user.name ?? '',
        email: user.email ?? '',
        role: roleName,
        password: '',
        pin: '',
      });
      setIsPopupOpen(true);
    });
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
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const handleSubmit = async () => {
    try {
      console.log('form submitted', userData);
      
      // Validate required fields
      if (!userData.name || !userData.email || !userData.role || (!isEditMode && (!userData.password || !userData.pin))) {
        alert('Please fill in all fields');
        return;
      }

      if (isEditMode) {
        if (!editingUserId) {
          alert('No user selected to edit');
          return;
        }
        const payload: Partial<UserData> = {
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };
        if (userData.password?.trim()) payload.password = userData.password;
        if (userData.pin?.trim()) payload.pin = userData.pin;
        await executeRequest('patch', `/users/${editingUserId}`, payload as any);
      } else {
        // Call the create user API
        await executeRequest('post', '/users', userData);
      }
      
      // Reset form and close popup
      setUserData({
        name: '',
        email: '',
        role: '',
        password: '',
        pin: ''
      });
      setEditingUserId(null);
      setIsEditMode(false);
      setIsPopupOpen(false);
      
      // Refresh the users list
      await fetchUsers();
      
      alert(isEditMode ? 'User updated successfully!' : 'User created successfully!');
    } catch (error) {
      console.error('Error saving user:', error);
      alert(isEditMode ? 'Failed to update user. Please try again.' : 'Failed to create user. Please try again.');
    }
  }
  const [userData,setUserData]=useState<UserData>({
    name: '',
    email: '',
    role: '',
    password: '',
    pin: ''
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
              addPermission='create_user'
            />
          </div>
        </div>
      </Layout>
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={isEditMode ? 'Edit User' : 'Add User'}
        width="600px"
        confirmText={isEditMode ? 'Save' : 'Add User'}
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
              <Input type='password' label={isEditMode ? 'Password (optional)' : 'Password'} name='password' value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} />
              <Input type='password' label={isEditMode ? 'Pin (optional)' : 'Pin'} name='pin' value={userData.pin} onChange={(e) => setUserData({...userData, pin: e.target.value})} />
          </form>
      </Popup>
    </>
  );
};

export default UserList;
