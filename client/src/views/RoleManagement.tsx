import React, { useState, useEffect } from 'react';
import { useApiRequest } from '../hooks/useApiRequest';
import roleService, { Role, CreateRoleDto, UpdateRoleDto } from '../services/roleService';
import permissionService, { Permission } from '../services/permissionService';
import Input from '../components/Input';
import TextField from '../components/TextField';
import './RoleManagement.css';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissions: [] as string[],
    isDefault: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { executeRequest } = useApiRequest<Role[]>();

  useEffect(() => {
    // fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await executeRequest('get', '/roles');
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isCreating) {
        await executeRequest('post', '/roles', formData);
        setIsCreating(false);
      } else if (selectedRole && isEditing) {
        await executeRequest('patch', `/roles/${selectedRole._id}`, formData);
        setIsEditing(false);
      }
      
      fetchRoles();
      
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

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      isDefault: role.isDefault,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await executeRequest('delete', `/roles/${id}`);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      isDefault: false,
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      isDefault: false,
    });
    setIsCreating(false);
    setIsEditing(false);
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  if (loading) return <div>Loading permissions...</div>;

  return (
    <div className="role-management">
      <div className="role-management-header">
        <h1>Role Management</h1>
        <p>Configure role permissions and access controls</p>
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
                      type="checkbox"
                      checked={formData.permissions.includes(permission._id)}
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
          onClick={handleCreateNew}
          disabled={loading}
        >
          Create New Role
        </button>
      </div>
    </div>
  );
};

export default RoleManagement; 