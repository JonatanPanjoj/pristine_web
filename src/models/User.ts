// models/User.ts

import { Timestamp } from "firebase/firestore";

export interface User {
    created_at: Timestamp | Date | string | any;
    email: string;
    id: string;
    is_enabled: boolean;
    language: string | null;
    name: string;
    notifications_enabled: boolean;
    notificationsLastOpened?: any;
    password: string;
    personal_answer: string;
    personal_question: string;
    phone: string;
    /**
     * Rol del que salieron sus permisos. Es una plantilla, no la autoridad: dice
     * "de aquí me los dieron", pero lo que el usuario puede hacer está en
     * `permissions`.
     */
    rol: string;
    /**
     * Permisos del usuario, por clave (`GUSU`, `REPCHK`). Es lo que decide el
     * acceso. Guarda claves y no ids de documento —al contrario que
     * `Role.permissions`— porque son las que compara `hasPermission`, y así
     * entrar no cuesta una lectura por permiso.
     */
    permissions?: string[];
    /** De dónde salieron: asignados a mano al usuario, o estampados por el rol. */
    permissions_source?: 'usuario' | 'rol';
    url_photo: string | null;
    user: string;
    user_id: number;
    sedes?: string[];
    categories?: string[];
  }
  