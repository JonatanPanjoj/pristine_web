import api from "../../../services/api";
import { Version } from "../../../models/Version";

export const getAllVersions = async (): Promise<Version[]> => {
  try {
    const response = await api.get('/versions');
    return response.data?.versions || [];
  } catch (error) {
    console.error("Error al obtener versiones:", error);
    return [];
  }
};

export const createVersion = async (version: Version): Promise<string> => {
  try {
    const response = await api.post('/versions', version);
    if (response.data && response.data.success) {
      return response.data.version.id;
    }
    throw new Error(response.data?.message || 'Error al crear versión');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al crear versión');
  }
};

export const updateVersion = async (id: string, version: Partial<Version>): Promise<void> => {
  try {
    await api.post('/versions', { ...version, id });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar versión');
  }
};

export const deleteVersion = async (id: string): Promise<void> => {
  try {
    await api.delete(`/versions/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al eliminar versión');
  }
};

