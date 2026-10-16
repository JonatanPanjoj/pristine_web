export type AuditoriaWeightingType = '1_10' | 'satisfactorio_no_satisfactorio' | 'si_no_na';

export interface AuditoriaQuestionItem {
  question_id: string;
  question_text: string;
  description?: string;
  weighting_type: AuditoriaWeightingType;
  is_photo_required: boolean;
  max_score: number;
}

export interface AuditoriaQuestionnaireSection {
  section_id: string;
  friendly_id: string;
  section_number: number;
  name: string;
  purpose: string;
  questions: AuditoriaQuestionItem[];
}

export interface AuditoriaQuestionnaire {
  id: string;
  friendly_id: string;
  category_id: string;
  name: string;
  description?: string;
  version: string;
  is_enabled: boolean;
  sections: AuditoriaQuestionnaireSection[];
  created_at?: string;
  updated_at?: string;
  user_registro_id?: string;
}
