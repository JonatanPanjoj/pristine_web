import api from "../../../services/api";
import { ChecklistRevision } from "../../../models/ChecklistRevision";

export const getRevisionByIdAdapter = async (
  revisionId: string
): Promise<ChecklistRevision | null> => {
  try {
    const response = await api.get(`/checklist-revisions/${revisionId}`);
    if (response.data && response.data.success) {
      return response.data.revision as ChecklistRevision;
    }
    return null;
  } catch (error) {
    console.error("Error fetching revision:", error);
    return null;
  }
};
