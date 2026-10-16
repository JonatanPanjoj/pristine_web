import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";

const SessionManager = () => {
  const [isExpired, setIsExpired] = useState(false); // Estado para controlar si la sesión expiró
  const userState = useSelector((state: RootState) => state.user); // Accede al estado del usuario

  useEffect(() => {
    const checkExpiration = () => {
      const expirationTime = 10 * 1000*60; // 30 segundos en milisegundos
      const savedItem = localStorage.getItem("persist:root"); // Recupera el estado persistido

      if (savedItem) {
        const parsedItem = JSON.parse(savedItem);
        const currentTime = new Date().getTime();

        if (parsedItem.timestamp && currentTime - parsedItem.timestamp > expirationTime) {
          setIsExpired(true); // Muestra el modal cuando la sesión expira
        }
      }
    };

    // Verifica cada segundo si ha expirado el estado
    const intervalId = setInterval(checkExpiration, 1000);

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, [userState]);

  return null
};

export default SessionManager;
