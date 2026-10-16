// src/pages/<sedeModule>/components/SedeFeriadosModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { Sede } from "../../../models/Sede";
import { useSedeFeriados } from "../hooks/useSedeFeriados";
import { FiCalendar, FiPlus, FiTrash2, FiSave, FiX, FiInbox } from "react-icons/fi";

interface SedeFeriadosModalProps {
  isOpen: boolean;
  sede: Sede | null;
  onClose: () => void;
  onSaved?: () => void; // para refrescar la tabla tras guardar
}

// "YYYY-MM-DD" → "lunes, 15 de septiembre de 2025"
// Se construye con partes locales para evitar el corrimiento de día por zona horaria (GT UTC-6).
const formatFecha = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}; // cierra const formatFecha

const SedeFeriadosModal: React.FC<SedeFeriadosModalProps> = ({
  isOpen,
  sede,
  onClose,
  onSaved,
}) => {
  const { saveFeriados, loading, error } = useSedeFeriados();
  const [fechas, setFechas] = useState<string[]>([]);
  const [nueva, setNueva] = useState("");

  // Al abrir con una sede, cargamos sus feriados actuales
  useEffect(() => {
    setFechas(sede?.fechas_feriado ?? []);
    setNueva("");
  }, [sede]); // cierra useEffect

  const agregar = () => {
    if (!nueva) return;
    if (fechas.includes(nueva)) return; // evita duplicados
    setFechas((prev) => [...prev, nueva].sort());
    setNueva("");
  }; // cierra const agregar

  const quitar = (iso: string) => {
    setFechas((prev) => prev.filter((f) => f !== iso));
  }; // cierra const quitar

  const guardar = async () => {
    if (!sede?.id) return;
    const ok = await saveFeriados(sede.id, fechas);
    if (ok) {
      onSaved?.();
      onClose();
    } // cierra if (ok)
  }; // cierra const guardar

  if (!isOpen || !sede) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
            <FiCalendar className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800 leading-tight">
              Fechas Feriadas
            </h2>
            <p className="text-xs text-slate-500 truncate">{sede.name}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Agregar fecha */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Agregar feriado
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") agregar();
                }}
                className="flex-1 px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary-gold focus:ring-1 focus:ring-primary-gold outline-none transition-colors"
              />
              <button
                type="button"
                onClick={agregar}
                disabled={!nueva}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
              >
                <FiPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de feriados */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">
              {fechas.length} feriado{fechas.length === 1 ? "" : "s"} registrado
              {fechas.length === 1 ? "" : "s"}
            </p>

            {fechas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                <FiInbox className="w-7 h-7 text-slate-300" />
                <p className="text-xs font-medium">Aún no hay feriados</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {fechas.map((iso) => (
                  <li
                    key={iso}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-amber-50 text-primary-gold flex items-center justify-center shrink-0">
                        <FiCalendar className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 capitalize truncate">
                          {formatFecha(iso)}
                        </p>
                        <p className="text-[11px] text-slate-400">{iso}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(iso)}
                      title="Quitar"
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FiX className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-60"
          >
            <FiSave className="w-4 h-4" />
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  ); // cierra return
}; // cierra const SedeFeriadosModal

export default SedeFeriadosModal;