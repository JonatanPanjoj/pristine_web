import storage from 'redux-persist/lib/storage'; // Usa localStorage para almacenar
import { EXPIRATION_TIME } from './sessionExpiry';

/**
 * Almacenamiento de redux-persist con caducidad.
 *
 * Es un almacén de clave-valor y nada más: no purga el persistor. `purge()`
 * borra las claves llamando a `removeItem` de este mismo objeto, así que si
 * `removeItem` volviera a purgar se llamarían el uno al otro sin fin y la
 * pestaña se quedaría sin memoria. Purgar es tarea de quien cierra la sesión.
 */
const customStorage = {
  getItem: async (key: string) => {
    try {
      const item = await storage.getItem(key);
      if (!item) return null;

      const parsedItem = JSON.parse(item);
      const currentTime = new Date().getTime();

      if (parsedItem.timestamp && currentTime - parsedItem.timestamp > EXPIRATION_TIME) {
        // Se borra la clave y se devuelve null: la rehidratación arranca con el
        // estado inicial, que es justo lo que se quiere de una sesión vencida.
        await storage.removeItem(key);
        return null;
      }

      return parsedItem.value;
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: any) => {
    const item = {
      value,
      timestamp: new Date().getTime(), // Marca de tiempo del último guardado
    };
    await storage.setItem(key, JSON.stringify(item));
  },

  removeItem: async (key: string) => {
    await storage.removeItem(key);
  },
};

export default customStorage;
