import { AuditoriaResponsibleType } from './AuditoriaCatalogs';

/**
 * Una dirección del grupo de avisos.
 *
 * Lleva el tipo consigo porque el mismo departamento avisa a gente de la casa y
 * a gente de fuera, y no se le escribe lo mismo a un jefe de área que a un
 * proveedor: al firmar hay que poder distinguirlos de un vistazo.
 */
export interface AuditoriaDepartmentEmail {
  email: string;
  type: AuditoriaResponsibleType;
  /** Nombre de quien responde, cuando el correo salió de alguien conocido. */
  name?: string;
}

export interface AuditoriaDepartment {
  id: string;
  friendly_id: string;
  name: string;
  code?: string;
  description?: string;
  /**
   * Grupo de responsables del departamento: a estas direcciones se avisa de la
   * auditoría y de los hallazgos que le tocan.
   */
  emails?: AuditoriaDepartmentEmail[];
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}
