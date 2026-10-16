import api from "../../../services/api";
import { ChecklistRevision } from "../../../models/ChecklistRevision";

export interface CreateRevisionPayload {
  scheduleId: string;
  checklistId: string;
  sedeId: string;
  sedeName: string;
  sectorId: string;
  sectorName: string;
  areaId: number;
  areaName: string;
  userId: string;
  userName: string;
}

export const createRevisionAdapter = async (
  payload: CreateRevisionPayload
): Promise<ChecklistRevision> => {
  try {
    const listRes = await api.get('/checklists');
    const lists: any[] = listRes.data?.checklists || [];
    const checklist = lists.find(l => l.id === payload.checklistId) || { name: 'Checklist', questions: [] };

    const answers = (checklist.questions || [])
      .filter((q: any) => q.isEnabled ?? true)
      .map((q: any) => ({
        questionId: q.id,
        questionText: q.questionText,
        value: "na",
        photoUrl: null,
        observations: "",
      }));

    const now = new Date().toISOString();
    const dataToSend = {
      schedule_id: payload.scheduleId,
      checklist_id: payload.checklistId,
      checklist_name: checklist.name,
      sede_id: payload.sedeId,
      sector_id: payload.sectorId,
      area_id: payload.areaId,
      user_id: payload.userId,
      user_name: payload.userName,
      answers,
      status: "pending",
      score: 100,
      revision_date: now,
    };

    const response = await api.post('/checklist-revisions', dataToSend);
    const rev = response.data?.revision;

    return {
      id: rev?.id || "temp",
      scheduleId: payload.scheduleId,
      checklist: {
        id: checklist.id,
        name: checklist.name,
        categoryId: checklist.categoryId,
        categoryName: checklist.categoryName,
      },
      location: {
        sedeId: payload.sedeId,
        sedeName: payload.sedeName,
        sectorId: payload.sectorId,
        sectorName: payload.sectorName,
        areaId: payload.areaId,
        areaName: payload.areaName,
      },
      user: {
        id: payload.userId,
        name: payload.userName,
      },
      status: "pending",
      answers,
      score: 100,
      compliancePercentage: 100,
      startedAt: now,
      finishedAt: null,
      createdAt: now,
      updatedAt: now,
    } as unknown as ChecklistRevision;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear la revisión.");
  }
};
