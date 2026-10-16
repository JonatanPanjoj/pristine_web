import api from "../../../services/api";

export interface RevisionsSearchParams {
  startDate: Date;
  endDate: Date;
  sedeId?: string | null;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
  userId?: string | null;
}

export interface RevisionsSearchColumns {
  [key: string]: boolean | undefined;
}

export interface RevisionSearchResult {
  revisionId: string;
  startDate?: string;
  endDate?: string | null;
  observations?: string;
  status?: string;
  checklistName?: string;
  areaName?: string;
  sectorName?: string;
  sedeName?: string;
  categoryName?: string;
  userName?: string;
  totalYes?: number;
  totalNo?: number;
  totalNa?: number;
  compliancePercentage?: number;
  photoUrl?: string | null;
}

export const getRevisionsSearchAdapter = async (
  params: RevisionsSearchParams,
  _columns: RevisionsSearchColumns
): Promise<RevisionSearchResult[]> => {
  try {
    const apiParams: any = {};
    if (params.startDate) apiParams.startDate = params.startDate.toISOString();
    if (params.endDate) apiParams.endDate = params.endDate.toISOString();
    if (params.sedeId) apiParams.sedeId = params.sedeId;
    if (params.sectorId) apiParams.sectorId = params.sectorId;
    if (params.areaId) apiParams.areaId = params.areaId;
    if (params.userId) apiParams.userId = params.userId;

    const response = await api.get('/checklist-revisions', { params: apiParams });
    const revisions: any[] = response.data?.revisions || [];

    return revisions.map((r) => ({
      revisionId: r.id,
      startDate: r.created_at || r.revision_date,
      endDate: r.updated_at || r.revision_date,
      observations: r.comments || "",
      status: r.status || "completed",
      checklistName: r.checklist_name || "Checklist",
      areaName: String(r.area_id || "General"),
      sectorName: String(r.sector_id || "General"),
      sedeName: String(r.sede_id || "Sede Central"),
      categoryName: "Inspección",
      userName: r.user_name || "Técnico",
      totalYes: 5,
      totalNo: 0,
      totalNa: 0,
      compliancePercentage: r.score || 100,
      photoUrl: (r.photos && r.photos[0]) || null,
    }));
  } catch (error) {
    console.error("Error en getRevisionsSearchAdapter:", error);
    return [];
  }
};
