import { getAllSedesFromCache, loadAndUpdateSedes } from "../../../services/sedeStorage";
import { Sede } from "../../../models/Sede";

// Función para obtener sedes habilitadas que contienen el ID del usuario
export const getEnabledSedesFromCache = (): Sede[] => {

  loadAndUpdateSedes();
  const allSedes = getAllSedesFromCache();

  if (!allSedes) {
    console.warn("No se encontraron sedes en el caché.");
    return [];
  }
  console.log("se hizo el llamado")

  // Filtrar sedes habilitadas
  const enabledSedes = allSedes.filter((sede: any) => sede.is_enabled !== false && sede.status !== false);

  return enabledSedes;
};
