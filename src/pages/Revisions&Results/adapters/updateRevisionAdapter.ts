// src/pages/Revisions&Results/adapters/updateRevisionAdapter.ts
import api from "../../../services/api";
import {
  ChecklistRevisionAnswer,
  ChecklistRevisionSupervisor,
} from "../../../models/ChecklistRevision";

export interface UpdateRevisionPayload {
  revisionId: string;
  answers: ChecklistRevisionAnswer[];
  observations: string;
  signatureUrl: string | null;
  supervisor: ChecklistRevisionSupervisor | null;
  photoUrl: string | null;
}

export const updateRevisionAdapter = async (
  payload: UpdateRevisionPayload
): Promise<void> => {
  try {
    const endDate = new Date().toISOString();
    await api.put(`/checklist-revisions/${payload.revisionId}`, {
      status: "completed",
      endDate,
      answers: payload.answers,
      observations: payload.observations,
      signatureUrl: payload.signatureUrl,
      PhotoUrl: payload.photoUrl,
      photoUrl: payload.photoUrl,
      supervisor: payload.supervisor,
    });
  } catch (error: any) {
    console.error("Error updating revision:", error);
    throw new Error(error.response?.data?.message || "Could not update revision.");
  }
};
