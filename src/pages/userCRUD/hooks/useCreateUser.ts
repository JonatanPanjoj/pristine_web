// hooks/useCreateUser.ts

import { useState } from 'react';
import { createUser } from '../adapters/UserAdapter'; // Asegúrate de la ruta correcta
import useEncryptDecrypt from '../../../hooks/encrypt/useEncryptDecrypt'; 
import { User } from '../../../models/User'; // Importa la interfaz User

const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { encrypt } = useEncryptDecrypt(); // Usa el hook de cifrado

  const handleCreateUser = async (userData: User) => {
    setLoading(true);
    setError(null); // Restablecer el error al inicio
    console.log("Intentando crear un usuario");

    // Promesa para manejar el timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Unable to create user within 10 seconds.")), 10000)
    );

    try {
      const encryptedPassword = encrypt(userData.password, userData.user); // Cifra usando el usuario y la contraseña
      userData.password = encryptedPassword;

      // Combina la creación de usuario con el timeout
      const userId = await Promise.race([createUser(userData), timeoutPromise]);
      return { success: true, message: "Usuario creado con éxito.", userId }; // Mensaje de éxito
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Manejo de error
        return { success: false, message: err.message }; // Asegúrate de retornar el mensaje del error
      } else {
        const defaultMessage = "Error desconocido"; // Manejo de error por defecto
        setError(defaultMessage); // Actualiza el estado de error
        return { success: false, message: defaultMessage }; // Mensaje de error por defecto
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleCreateUser, loading, error };
};

export default useCreateUser;
