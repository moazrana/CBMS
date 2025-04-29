import { useState, useEffect } from 'react';
import permissionService, { Permission } from '../services/permissionService';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionsByModule = async (module: string) => {
    try {
      setLoading(true);
      const data = await permissionService.getPermissionsByModule(module);
      setPermissions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    fetchPermissionsByModule
  };
}; 