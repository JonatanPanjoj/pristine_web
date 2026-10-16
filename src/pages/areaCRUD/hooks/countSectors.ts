import { countSectorsBySedeId } from "../adapters/fetchSectorCount";

interface CountSectorsResult {
  sectorCount: number | null;
  loading: boolean;
  error: string | null;
}

// Función para contar sectores por sedeId
export const countSectors = async (sedeId: string): Promise<CountSectorsResult> => {
  let result: CountSectorsResult = {
    sectorCount: null,
    loading: true,
    error: null,
  };

  try {
    const count = await countSectorsBySedeId(sedeId);
    result = { sectorCount: count, loading: false, error: null };
  } catch (err) {
    result = { sectorCount: null, loading: false, error: "Error al obtener el conteo de sectores" };
    console.error(err);
  }

  return result;
};
