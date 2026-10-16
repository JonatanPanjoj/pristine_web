export interface AuditoriaSection {
  id: string;
  friendly_id: string;
  questionnaire_id?: string;
  category_id?: string;
  section_number: number;
  name: string;
  purpose: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}
