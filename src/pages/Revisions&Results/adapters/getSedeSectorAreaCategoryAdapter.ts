import api from '../../../services/api';

// Función para obtener una Sede por su ID
export const getSedeById = async (sedeId: string): Promise<any> => {
  try {
    const res = await api.get('/sedes');
    const sedes = res.data?.sedes || [];
    const found = sedes.find((s: any) => s.id === sedeId || s._id === sedeId);
    if (!found) {
      throw new Error(`La sede con ID ${sedeId} no existe.`);
    }
    return found;
  } catch (error) {
    console.error('Error al obtener la sede:', error);
    throw error;
  }
};

// Función para obtener un Sector por su ID
export const getSectorById = async (sectorId: string): Promise<any> => {
  try {
    const res = await api.get('/sectors');
    const sectors = res.data?.sectors || [];
    const found = sectors.find((s: any) => s.id === sectorId || s._id === sectorId);
    if (!found) {
      throw new Error(`El sector con ID ${sectorId} no existe.`);
    }
    return found;
  } catch (error) {
    console.error('Error al obtener el sector:', error);
    throw error;
  }
};

// Función para obtener un Área por una columna específica (ejemplo: columna de tipo int)
export const getAreaById = async (areaId: number): Promise<any> => {
  try {
    const res = await api.get('/areas');
    const areas = res.data?.areas || [];
    const found = areas.find((a: any) => Number(a.area_id) === Number(areaId));
    if (!found) {
      throw new Error(`El área con ID ${areaId} no existe.`);
    }
    return found;
  } catch (error) {
    console.error('Error al obtener el área:', error);
    throw error;
  }
};

// Función para obtener una Categoría_Checklist por su ID
export const getCategoriaChecklistById = async (categoriaChecklistId: string): Promise<any> => {
  try {
    const res = await api.get('/checklist-categories');
    const categories = res.data?.categories || [];
    const found = categories.find((c: any) => c.id === categoriaChecklistId || c._id === categoriaChecklistId);
    if (!found) {
      throw new Error(`La categoría con ID ${categoriaChecklistId} no existe.`);
    }
    return found;
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    throw error;
  }
};
