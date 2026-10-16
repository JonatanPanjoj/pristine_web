import { useState, useEffect } from "react";
import { getChecklistConfigAdapter, saveChecklistConfigAdapter } from "../adapters/checklistConfigAdapter";
import { ChecklistConfig } from "../../../models/ChecklistConfig";

export const useChecklistConfig = () => {
  const [config, setConfig] = useState<ChecklistConfig>({ requireQR: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChecklistConfigAdapter();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener configuración");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: ChecklistConfig) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveChecklistConfigAdapter(newConfig);
      setConfig(newConfig);
      setSuccess("Configuración guardada exitosamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return { config, loading, saving, error, success, saveConfig, reload: fetchConfig };
};
