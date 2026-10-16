// src/pages/versionApp/components/VersionForm.tsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import useCreateVersion from "../hooks/useCreateVersion";
import { ExitoCard } from "../../../components/ExitoCard";
import { Version } from "../../../models/Version";
import { FiSave, FiSmartphone, FiTag, FiLink, FiBox } from "react-icons/fi";
import { SOFTWARE_OPTIONS } from "../utils/appSoftware";

interface VersionFormProps {
  onSuccess?: () => void;
}

const PLATFORMS = ["android", "ios", "web"];

const inputCls =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400";
const labelCls =
  "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

const VersionForm: React.FC<VersionFormProps> = ({ onSuccess }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { handleCreateVersion, loading } = useCreateVersion();

  const [software, setSoftware] = useState(SOFTWARE_OPTIONS[0]);
  const [plataforma, setPlataforma] = useState("android");
  const [version, setVersion] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  const resetForm = () => {
    setSoftware(SOFTWARE_OPTIONS[0]);
    setPlataforma("android");
    setVersion("");
    setDownloadUrl("");
  }; // cierra const resetForm

  const handleSubmit = async () => {
    if (!software.trim()) {
      notify(false, "Ingresa el nombre del software.");
      return;
    } // cierra if (!software.trim())
    if (!version.trim()) {
      notify(false, "Ingresa el número de versión.");
      return;
    } // cierra if (!version.trim())
    if (!downloadUrl.trim()) {
      notify(false, "Ingresa la URL de descarga.");
      return;
    } // cierra if (!downloadUrl.trim())

    const newVersion: Version = {
      ver_software: software.trim(),
      ver_plataforma: plataforma,
      ver_version: version.trim(),
      ver_download_url: downloadUrl.trim(),
      ver_usuario_id: user?.id ?? "",
      // ver_codigo y ver_usuario_update se dejan vacíos (campos de migración)
    };

    const { success: ok, message: msg } = await handleCreateVersion(newVersion);
    notify(ok, msg);
    if (ok) {
      resetForm();
      // onSuccess se dispara al cerrar la ExitoCard (abajo), para que el toast
      // alcance a verse antes de que se cierre el modal.
    } // cierra if (ok)
  }; // cierra const handleSubmit

  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
          <FiBox className="w-4 h-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
            Nueva versión
          </p>
          <h2 className="text-[15px] font-semibold text-gray-900">
            Registrar versión de la app
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Software</label>
          <div className="relative">
            <FiBox className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
            <select
              className={`${inputCls} pl-10 appearance-none`}
              value={software}
              onChange={(e) => setSoftware(e.target.value)}
            >
              {SOFTWARE_OPTIONS.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Plataforma</label>
          <div className="relative">
            <FiSmartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
            <select
              className={`${inputCls} pl-10 appearance-none`}
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Versión</label>
          <div className="relative">
            <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
            <input
              className={`${inputCls} pl-10`}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              maxLength={5}
              placeholder="1.0.0"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>URL de descarga</label>
          <div className="relative">
            <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
            <input
              className={`${inputCls} pl-10`}
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              maxLength={500}
              placeholder="https://…"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60"
        >
          <FiSave className="w-4 h-4" />
          {loading ? "Guardando…" : "Guardar versión"}
        </button>
      </div>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => {
            setShowSuccessCard(false);
            if (success && onSuccess) onSuccess();
          }}
          loading={loading}
          success={success}
          message={message}
        />
      )}
    </div>
  ); // cierra return
}; // cierra const VersionForm

export default VersionForm;
