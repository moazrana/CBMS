import React, { useState, useEffect } from 'react';
import { useApiRequest } from '../../../hooks/useApiRequest';
import roleService, { Role, CreateRoleDto, UpdateRoleDto } from '../../../services/roleService';
import permissionService, { Permission } from '../../../services/permissionService';
import Input from '../../../components/input/Input';
import TextField from '../../../components/textField/TextField';
import Layout from '../../../layouts/layout';
import './RoleManagement.css';

const RoleManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissions: [] as Permission[],
    isDefault: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Create New Role');
  
  const { executeRequest } = useApiRequest<Role[]>();

  useEffect(() => {
    checkPage();
  }, []);
  useEffect(() => {
    fetchPermissions();
  }, [isEditing,isCreating]);
  
  const checkPage = async () => {
    const url = window.location.href;
    if(url.includes('add')){
      console.log('is creating ')
      setIsCreating(true);
    }
    else if(url.includes('edit')){
      console.log('is editing ')
      setIsEditing(true);
      setButtonText('Update Role');
      // setIsCreating(false); 
      // fetchRole();
    }
  }
  
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
     
      
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('using effect permissions: ', permissions);
    if(isEditing){
      if(permissions.length > 0){
        if(isEditing){
          fetchRole()
        }
      }
    }
  }, [permissions]);
  
  const fetchRole = async () => {
    const url = window.location.href;
    const id = url.split('/').pop();
    
    const res = await executeRequest('get', `/roles/${id}`);
    setSelectedRole(res);
    
    setFormData({
      name: res.name,
      description: res.description,
      permissions: res.permissions,
      isDefault: res.isDefault,
    });
    
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(formData);
    e.preventDefault();
    setError(null);
    console.log(isCreating);
    try {
      if (isCreating) {
        console.log('here')
        let res = await executeRequest('post', '/roles', formData);
        if(res){
          window.location.href = '/roles';
        }
        setIsCreating(false);
      } else if (selectedRole && isEditing) {
        let res = await executeRequest('patch', `/roles/${selectedRole._id}`, formData);
        if(res){
          window.location.href = '/roles';
        }
        console.log('res: ', res);
        setIsEditing(false);
      }
      
      setFormData({
        name: '',
        description: '',
        permissions: [],
        isDefault: false,
      });
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    console.log('permissionId: ', permissionId);
    const permission = permissions.find(p => p._id === permissionId);
    if (!permission) return;
    
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.some(p => p._id === permissionId)
        ? prev.permissions.filter(p => p._id !== permissionId)
        : [...prev.permissions, permission]
    }));
    console.log('pers: ', formData.permissions);
  };

  if (loading) return <div>Loading permissions...</div>;

  return (
    <Layout>
      <div className="role-management">
        <div className="role-management-header">
          <h1>Role Management</h1>
        </div>
        <div className="role-form">
          <div className="form-group">
            <Input
              label="Role Name"
              name="name" 
              value={formData.name}
              onChange={handleInputChange}            
              placeholder="Enter role name"
            />
          </div>
          <div className="form-group">
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter role description"
            />
          </div>
        </div>
        <div className="role-management-content">
          <h2>Permissions</h2>
          <div className="permissions-table-container">
            <table className="permissions-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Permission</th>
                  <th>Description</th>
                  <th>Grant</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(permission => (
                  <tr key={permission._id}>
                    <td>{permission.module}</td>
                    <td>{permission.name}</td>
                    <td>{permission.description}</td>
                    <td>
                      <input
                        id={permission.name}
                        type="checkbox"
                        checked={formData.permissions.some(p => p.name === permission.name)}
                        onChange={() => handlePermissionChange(permission._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="role-form-actions">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default RoleManagement; 