import api from "../../../services/api";

// Función para obtener el nombre de un sector por su ID
export const getSectorNameById = async (sectorId: string): Promise<string | null> => {
  if (!sectorId) return null;
  try {
    const res = await api.get('/sectors');
    const sectors = res.data?.sectors || [];
    const found = sectors.find((s: any) => s.id === sectorId || s._id === sectorId);
    return found ? found.name : null;
  } catch (error) {
    console.error("Error al obtener nombre de sector:", error);
    return null;
  }
};
