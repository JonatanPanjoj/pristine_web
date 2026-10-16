import api from "../../../services/api";

export const getUserByCredentials = async (user: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { user, password });
    if (response.data && response.data.success) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    console.error("Error en getUserByCredentials:", error);
    return null;
  }
};

export const getRoleById = async (roleId: string) => {
  try {
    const response = await api.get('/roles');
    if (response.data && response.data.success) {
      const found = response.data.roles.find((r: any) => r.id === roleId || r.name === roleId);
      return found || null;
    }
    return null;
  } catch (error) {
    console.error("Error en getRoleById:", error);
    return null;
  }
};

export const getPermissionsByIds = async (permissionsIds: string[]) => {
  try {
    const response = await api.get('/permissions');
    if (response.data && response.data.success) {
      return response.data.permissions
        .filter((p: any) => permissionsIds.includes(p.id) || permissionsIds.includes(p.key))
        .map((p: any) => p.key);
    }
    return permissionsIds;
  } catch (error) {
    console.error("Error en getPermissionsByIds:", error);
    return permissionsIds;
  }
};
