// src/pages/userCRUD/adapters/ProfileAdapter.ts
import api from "../../../services/api";
import { User } from "../../../models/User";

export const updateUserFields = async (
  userId: string,
  fields: Partial<User>
): Promise<void> => {
  if (!userId) {
    throw new Error("No se encontró el ID del usuario.");
  }
  const response = await api.put(`/users/${userId}`, fields);
  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Error al actualizar el usuario');
  }
};

export const updateProfilePhoto = async (
  userId: string,
  url: string
): Promise<void> => {
  if (!userId) {
    throw new Error("No se encontró el ID del usuario.");
  }
  const response = await api.put(`/users/${userId}`, { url_photo: url });
  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Error al actualizar la foto de perfil');
  }
};

export const changePassword = async (
  userId: string,
  encryptedCurrent: string,
  encryptedNew: string
): Promise<void> => {
  if (!userId) {
    throw new Error("No se encontró el ID del usuario.");
  }
  const response = await api.post('/auth/change-password', {
    userId,
    currentPassword: encryptedCurrent,
    newPassword: encryptedNew,
  });
  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Error al actualizar la contraseña');
  }
};

export const updateSecurityQuestion = async (
  userId: string,
  question: string,
  encryptedAnswer: string
): Promise<void> => {
  if (!userId) {
    throw new Error("No se encontró el ID del usuario.");
  }
  const response = await api.put(`/users/${userId}`, {
    personal_question: question,
    personal_answer: encryptedAnswer,
  });
  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Error al actualizar la pregunta de seguridad');
  }
};

export const deactivateAccount = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error("No se encontró el ID del usuario.");
  }
  const response = await api.patch(`/users/${userId}/status`, {
    status: false,
    is_enabled: false,
  });
  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Error al desactivar la cuenta');
  }
};

export const updatePassword = changePassword;
