// models/ChecklistQuestion.ts
// No tiene colección propia — se embebe dentro de Checklist.questions[]

export type ChecklistQuestionType = "binary" | "text" | "numeric";

export interface ChecklistQuestion {
  id: string;
  questionText: string;
  order: number;
  isEnabled: boolean;
  type: ChecklistQuestionType;
  requiresPhoto: boolean;
}
