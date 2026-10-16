import { getAllSedesFromCache, loadAndUpdateSedes } from "../../../services/sedeStorage";
import { Sede } from "../../../models/Sede";

// Función para obtener sedes habilitadas que contienen el ID del usuario
export const getEnabledSedesForUser = (userId: string): Sede[] => {
  loadAndUpdateSedes();

  const allSedes = getAllSedesFromCache();
  if (!allSedes) {
    return [];
  }

  const enabledSedes = allSedes.filter(
    (sede: any) => sede.is_enabled !== false && sede.status !== false
  );

  const userAssigned = enabledSedes.filter((sede: Sede) => sede.user_ids?.includes(userId));
  return userAssigned.length > 0 ? userAssigned : enabledSedes;
};
