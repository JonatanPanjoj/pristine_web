export type Timestamp = { seconds: number; nanoseconds: number } | string | Date | any;

export interface User {
  email?: string;
  id?: string;
  is_enabled?: boolean;
  language?: string | null;
  user?: string;
  name?: string;
  notifications_enabled?: boolean;
  notificationsLastOpened?: any;
  personal_answer?: string;
  personal_question?: string;
  phone?: string;
  rol?: string;
  url_photo?: string | null;
  user_id?: number;
  rol_name?: string | null;
  created_at?: Timestamp;
  /** Claves de permiso de la sesión: salen del usuario, o del rol si no tiene propias. */
  permissions?: string[];
  permissions_source?: 'usuario' | 'rol';
}