import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import { persistor } from '../store/store';
import { millisecondsUntilExpiry } from '../store/sessionExpiry';

/**
 * Un temporizador largo no es fiable: si el equipo se suspende, el navegador lo
 * congela. Se vuelve a comprobar al menos cada minuto, y también al recuperar
 * el foco, que es cuando de verdad importa acertar.
 */
const MAX_CHECK_INTERVAL = 60 * 1000;

/**
 * Vigila el vencimiento de la sesión mientras la app está abierta. Al vencer,
 * cierra la sesión y avisa, en lugar de esperar a la siguiente recarga.
 * @param enabled - Solo se vigila si hay una sesión activa que vigilar.
 * @returns `true` cuando la sesión acaba de vencer.
 */
export const useSessionExpiration = (enabled: boolean): boolean => {
  const dispatch = useDispatch();
  const [expired, setExpired] = useState(false);

  const closeSession = useCallback(() => {
    setExpired(true);
    dispatch(logout());
    // No se espera: el aviso ya está en pantalla y el estado de Redux ya quedó
    // limpio. Si el borrado del disco falla, la sesión igual está cerrada.
    persistor.purge().catch(() => undefined);
  }, [dispatch]);

  useEffect(() => {
    if (!enabled || expired) return undefined;

    let timeoutId = 0;

    const check = () => {
      const remaining = millisecondsUntilExpiry();
      if (remaining === null) return;

      if (remaining <= 0) {
        closeSession();
        return;
      }

      timeoutId = window.setTimeout(check, Math.min(remaining, MAX_CHECK_INTERVAL));
    };

    check();
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled, expired, closeSession]);

  return expired;
};
