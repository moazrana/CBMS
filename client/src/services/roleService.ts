import api from './api';

export interface Permission {
  _id?: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

const roleService = {
  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get a role by ID
  getRoleById: async (id: string): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Get a role by name
  getRoleByName: async (name: string): Promise<Role> => {
    const response = await api.get(`/roles/name/${name}`);
    return response.data;
  },

  // Create a new role
  createRole: async (role: CreateRoleDto): Promise<Role> => {
    const response = await api.post('/roles', role);
    return response.data;
  },

  // Update a role
  updateRole: async (id: string, role: UpdateRoleDto): Promise<Role> => {
    const response = await api.patch(`/roles/${id}`, role);
    return response.data;
  },

  // Delete a role
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};

export default roleService; 