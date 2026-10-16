// src/hooks/useSedeSync.ts
import { useEffect } from "react";
import { loadAndUpdateSedes } from "../services/sedeStorage";

export function useSedeSync() {
  useEffect(() => {
    loadAndUpdateSedes(); // Al montar

    const handleFocus = () => loadAndUpdateSedes(); // Al volver a la pestaña
    window.addEventListener("visibilitychange", handleFocus);
    return () => window.removeEventListener("visibilitychange", handleFocus);
  }, []);
}