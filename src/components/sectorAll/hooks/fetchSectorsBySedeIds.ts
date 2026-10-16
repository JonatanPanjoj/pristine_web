// fetchSectorsBySedeIds.ts
import { Sector } from "../../../models/Sector";
import { getSectorsBySedeIdsAdapter } from "../adapters/getSectorsBySedeIdsAdapter";

interface FetchSectorsOptions {
  sedeIds: string[]; // Array de IDs de sede
}

// Función para obtener los sectores según un array de sedeIds
export const fetchSectorsBySedeIds = async (options: FetchSectorsOptions): Promise<Sector[]> => {
  try {
    const { sectors } = await getSectorsBySedeIdsAdapter(options);
    return sectors;
  } catch (error) {
    console.error("Error fetching sectors by sedeIds:", error);
    return [];
  }
};
