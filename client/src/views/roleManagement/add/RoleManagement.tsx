import React, { useState, useEffect, useMemo } from 'react';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { Role, CreateRoleDto } from '../../../services/roleService';
import permissionService, { Permission } from '../../../services/permissionService';
import Input from '../../../components/input/Input';
import TextField from '../../../components/textField/TextField';
import Layout from '../../../layouts/layout';
import Popup from '../../../components/Popup/Popup';
import './RoleManagement.css';

const ACTIONS = ['read', 'create', 'update', 'delete'] as const;
type Action = typeof ACTIONS[number];

function groupPermissionsByModule(permissions: Permission[]): Map<string, Record<Action, Permission | undefined>> {
  const map = new Map<string, Record<Action, Permission | undefined>>();
  for (const p of permissions) {
    const action = (p.action || '').toLowerCase() as Action;
    if (!ACTIONS.includes(action)) continue;
    if (!map.has(p.module)) {
      map.set(p.module, { read: undefined, create: undefined, update: undefined, delete: undefined });
    }
    const row = map.get(p.module)!;
    row[action] = p;
  }
  return map;
}

function getAdvancePermissionsByModule(permissions: Permission[]): Map<string, Permission[]> {
  const map = new Map<string, Permission[]>();
  const crud = new Set(ACTIONS);
  for (const p of permissions) {
    const action = (p.action || '').toLowerCase();
    if (crud.has(action as Action)) continue;
    const list = map.get(p.module) || [];
    list.push(p);
    map.set(p.module, list);
  }
  return map;
}

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
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Create New Role');
  const [advancePopupModule, setAdvancePopupModule] = useState<string | null>(null);

  const { executeRequest } = useApiRequest<Role[]>();

  const permissionsByModule = useMemo(() => groupPermissionsByModule(permissions), [permissions]);
  const advancePermissionsByModule = useMemo(() => getAdvancePermissionsByModule(permissions), [permissions]);
  const moduleNames = useMemo(() => Array.from(permissionsByModule.keys()).sort(), [permissionsByModule]);

  useEffect(() => {
    checkPage();
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [isEditing, isCreating]);

  const checkPage = async () => {
    const url = window.location.href;
    if (url.includes('add')) {
      setIsCreating(true);
    } else if (url.includes('edit')) {
      setIsEditing(true);
      setButtonText('Update Role');
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

  useEffect(() => {
    if (isEditing && permissions.length > 0) {
      fetchRole();
    }
  }, [permissions, isEditing]);

  const fetchRole = async () => {
    const url = window.location.href;
    const id = url.split('/').pop();
    const res = await executeRequest('get', `/roles/${id}`);
    setSelectedRole(res);
    setFormData({
      name: res.name,
      description: res.description || '',
      permissions: res.permissions || [],
      isDefault: res.isDefault ?? false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCreating) {
        const res = await executeRequest('post', '/roles', formData);
        if (res) {
          window.location.href = '/roles';
        }
        setIsCreating(false);
      } else if (selectedRole && isEditing) {
        const res = await executeRequest('patch', `/roles/${selectedRole._id}`, formData);
        if (res) {
          window.location.href = '/roles';
        }
        setIsEditing(false);
      }
      setFormData({
        name: '',
        description: '',
        permissions: [],
        isDefault: false,
      });
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const isPermissionGranted = (permission: Permission) =>
    formData.permissions.some((p) => (p as Permission)._id === permission._id || p.name === permission.name);

  const handlePermissionChange = (permission: Permission) => {
    const permissionId = (permission as Permission)._id;
    const isGranted = formData.permissions.some(
      (p) => (p as Permission)._id === permissionId || p.name === permission.name,
    );
    setFormData((prev) => ({
      ...prev,
      permissions: isGranted
        ? prev.permissions.filter((p) => (p as Permission)._id !== permissionId && p.name !== permission.name)
        : [...prev.permissions, permission],
    }));
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
                  <th>Read</th>
                  <th>Create</th>
                  <th>Update</th>
                  <th>Delete</th>
                  <th className="permissions-table-advance-col">Advance</th>
                </tr>
              </thead>
              <tbody>
                {moduleNames.map((moduleName) => {
                  const row = permissionsByModule.get(moduleName)!;
                  const advancePerms = advancePermissionsByModule.get(moduleName) || [];
                  return (
                    <tr key={moduleName}>
                      <td className="permissions-table-module">{moduleName}</td>
                      {ACTIONS.map((action) => {
                        const permission = row[action];
                        if (!permission) {
                          return <td key={action} className="permissions-table-cell-empty" />;
                        }
                        return (
                          <td key={action} className="permissions-table-cell">
                            <input
                              type="checkbox"
                              title={permission.description}
                              checked={isPermissionGranted(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              aria-label={permission.description}
                            />
                          </td>
                        );
                      })}
                      <td className="permissions-table-advance-cell">
                        {advancePerms.length > 0 ? (
                          <button
                            type="button"
                            className="advance-permissions-btn"
                            onClick={() => setAdvancePopupModule(moduleName)}
                          >
                            Advance
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
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

        <Popup
          isOpen={advancePopupModule !== null}
          onClose={() => setAdvancePopupModule(null)}
          onConfirm={() => setAdvancePopupModule(null)}
          title={advancePopupModule ? `Advance permissions – ${advancePopupModule}` : 'Advance permissions'}
          confirmText="Done"
          cancelText="Close"
          width="480px"
        >
          {advancePopupModule && (
            <div className="advance-permissions-list">
              {(advancePermissionsByModule.get(advancePopupModule) || []).map((permission) => (
                <label key={permission._id} className="advance-permission-item">
                  <input
                    type="checkbox"
                    title={permission.description}
                    checked={isPermissionGranted(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    aria-label={permission.description}
                  />
                  <span className="advance-permission-name">{permission.name}</span>
                </label>
              ))}
            </div>
          )}
        </Popup>
      </div>
    </Layout>
  );
};

export default RoleManagement;
