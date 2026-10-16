import api from "../../../services/api";

export const toggleRoleStatusInDatabase = async (roleId: string, currentStatus?: boolean): Promise<boolean> => {
  try {
    const newStatus = currentStatus !== undefined ? !currentStatus : true;
    const response = await api.put(`/roles/${roleId}`, { status: newStatus, is_enabled: newStatus });
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Error al cambiar el estado del rol.");
    }
    return newStatus;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Error al cambiar el estado del rol.");
  }
};

export const toggleRoleStatusInFirestore = toggleRoleStatusInDatabase;
