import api from "../../../services/api";

export const countSectorsBySedeId = async (sedeId: string): Promise<number> => {
  try {
    const res = await api.get('/sectors', { params: { sedeId } });
    const sectors = res.data?.sectors || [];
    return sectors.length;
  } catch (error) {
    console.error("Error al contar los sectores:", error);
    return 0;
  }
};
