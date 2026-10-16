// src/pages/versionApp/components/VersionModal.tsx
import React, { useState, useEffect } from "react";
import { softwareOptionsFor } from "../utils/appSoftware";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useUpdateVersion } from "../hooks/useUpdateVersion";
import { ExitoCard } from "../../../components/ExitoCard";
import { Version } from "../../../models/Version";
import { FiX, FiSave, FiExternalLink } from "react-icons/fi";
import ModalPortal from "../../../components/ModalPortal";

interface VersionModalProps {
  version: Version;
  isOpen: boolean;
  mode: "view" | "edit";
  onClose: () => void;
  onSubmit: () => void;
}

const PLATFORMS = ["android", "ios", "web"];

const inputCls =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400";
const readonlyCls =
  "w-full px-4 py-2.5 text-sm text-gray-600 bg-gray-100/70 border border-transparent rounded-xl";
const labelCls =
  "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

const VersionModal: React.FC<VersionModalProps> = ({
  version,
  isOpen,
  mode,
  onClose,
  onSubmit,
}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { updateVersionById, loading } = useUpdateVersion();

  const isEdit = mode === "edit";

  const [software, setSoftware] = useState(version.ver_software ?? "");
  const [plataforma, setPlataforma] = useState(version.ver_plataforma ?? "android");
  const [versionNum, setVersionNum] = useState(version.ver_version ?? "");
  const [downloadUrl, setDownloadUrl] = useState(version.ver_download_url ?? "");

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Sincroniza los campos cuando cambia la versión seleccionada
  useEffect(() => {
    setSoftware(version.ver_software ?? "");
    setPlataforma(version.ver_plataforma ?? "android");
    setVersionNum(version.ver_version ?? "");
    setDownloadUrl(version.ver_download_url ?? "");
  }, [version]); // cierra useEffect

  if (!isOpen) {
    return null;
  } // cierra if (!isOpen)

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  const handleSave = async () => {
    if (!software.trim()) {
      notify(false, "Ingresa el nombre del software.");
      return;
    } // cierra if (!software.trim())
    if (!versionNum.trim()) {
      notify(false, "Ingresa el número de versión.");
      return;
    } // cierra if (!versionNum.trim())
    if (!downloadUrl.trim()) {
      notify(false, "Ingresa la URL de descarga.");
      return;
    } // cierra if (!downloadUrl.trim())
    if (!version.id) return;

    const ok = await updateVersionById(version.id, {
      ver_software: software.trim(),
      ver_plataforma: plataforma,
      ver_version: versionNum.trim(),
      ver_download_url: downloadUrl.trim(),
      ver_usuario_id: user?.id ?? "",
    });

    notify(ok, ok ? "Versión actualizada." : "No se pudo actualizar la versión.");
    if (ok) {
      onSubmit();
    } // cierra if (ok)
  }; // cierra const handleSave

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Editar versión" : "Detalle de la versión"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Software</label>
              {isEdit ? (
                <select
                  className={`${inputCls} appearance-none`}
                  value={software}
                  onChange={(e) => setSoftware(e.target.value)}
                >
                  {softwareOptionsFor(version.ver_software).map((app) => (
                    <option key={app} value={app}>
                      {app}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={readonlyCls}>{software || "—"}</div>
              )}
            </div>

            <div>
              <label className={labelCls}>Plataforma</label>
              {isEdit ? (
                <select
                  className={`${inputCls} appearance-none`}
                  value={plataforma}
                  onChange={(e) => setPlataforma(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={readonlyCls}>{plataforma || "—"}</div>
              )}
            </div>

            <div>
              <label className={labelCls}>Versión</label>
              {isEdit ? (
                <input
                  className={inputCls}
                  value={versionNum}
                  onChange={(e) => setVersionNum(e.target.value)}
                  maxLength={5}
                />
              ) : (
                <div className={readonlyCls}>{versionNum || "—"}</div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>URL de descarga</label>
              {isEdit ? (
                <input
                  className={inputCls}
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  maxLength={500}
                />
              ) : (
                <div className={`${readonlyCls} flex items-center justify-between gap-2`}>
                  <span className="truncate">{downloadUrl || "—"}</span>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 shrink-0"
                      title="Abrir enlace"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Campos de migración (solo lectura, si existen) */}
            {(version.ver_codigo ?? null) !== null && (
              <div>
                <label className={labelCls}>Código (migración)</label>
                <div className={readonlyCls}>{version.ver_codigo}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          {isEdit && (
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60"
              >
                <FiSave className="w-4 h-4" />
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>

        {showSuccessCard && (
          <ExitoCard
            onClose={() => setShowSuccessCard(false)}
            loading={loading}
            success={success}
            message={message}
          />
        )}
      </div>
    </ModalPortal>
  ); // cierra return
}; // cierra const VersionModal

export default VersionModal;
