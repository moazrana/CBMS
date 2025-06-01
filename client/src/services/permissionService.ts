import api from './api';

export interface Permission {
  _id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

const permissionService = {
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions');
    return response.data;
  },

  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  getPermissionsByModule: async (module: string): Promise<Permission[]> => {
    const response = await api.get(`/permissions/module/${module}`);
    return response.data;
  },

  createPermission: async (permission: Omit<Permission, '_id'>): Promise<Permission> => {
    const response = await api.post('/permissions', permission);
    return response.data;
  },

  updatePermission: async (id: string, permission: Partial<Permission>): Promise<Permission> => {
    const response = await api.patch(`/permissions/${id}`, permission);
    return response.data;
  },

  deletePermission: async (id: string): Promise<void> => {
    await api.delete(`/permissions/${id}`);
  }
};

export default permissionService; 