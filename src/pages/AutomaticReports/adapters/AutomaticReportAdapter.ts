import api from "../../../services/api";
import { AutomaticReport } from "../../../models/AutomaticReport";

export const getAllAutomaticReports = async (): Promise<AutomaticReport[]> => {
  try {
    const response = await api.get('/automatic-reports');
    return response.data?.reports || [];
  } catch (error) {
    console.error("Error al obtener reportes automáticos:", error);
    return [];
  }
};

export const createAutomaticReport = async (report: AutomaticReport): Promise<string> => {
  try {
    const response = await api.post('/automatic-reports', report);
    if (response.data && response.data.success) {
      return response.data.report.id;
    }
    throw new Error(response.data?.message || 'Error al crear reporte automático');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al crear reporte automático');
  }
};

export const updateAutomaticReport = async (
  id: string,
  report: Partial<AutomaticReport>
): Promise<void> => {
  try {
    await api.put(`/automatic-reports/${id}`, report);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar reporte automático');
  }
};

export const deleteAutomaticReport = async (id: string): Promise<void> => {
  try {
    await api.delete(`/automatic-reports/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al eliminar reporte automático');
  }
};
