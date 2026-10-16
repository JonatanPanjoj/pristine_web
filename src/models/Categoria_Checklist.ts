export interface Categoria_Checklist
{
    categoria_id?: string;
    color: string;
    id: string;
    is_enabled: boolean;
    name: string;
    updatedAt: string; // Puede ser Date si deseas transformarlo al obtenerlo de Firestore
    user_registro?: string;
    users_id?: string[]; // Array de IDs de usuarios
  }
  