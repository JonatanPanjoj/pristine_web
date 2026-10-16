// models/Role.ts
export interface Role {
  category: string;
  description: string;
  id: string;
  is_enabled: boolean;
  name: string;
  permissions: string[];
  rol_id: number;
}
