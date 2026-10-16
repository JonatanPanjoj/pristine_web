// src/pages/sedeCRUD/components/SedeFormPanel.tsx
import React, { useRef, useState } from "react";
import { useGeoData } from "../hooks/useGeoData";
import { useImageUploader } from "../../../components/uploadImage/hooks/useImageUploader";
import { Sede } from "../../../models/Sede";
import { FiUploadCloud, FiMapPin, FiSave, FiRotateCcw, FiGlobe, FiX } from "react-icons/fi";

export type SedeDraft = Omit<Sede, "id" | "updatedAt"> & { id?: string };

interface SedeFormPanelProps {
  draft: SedeDraft;
  setField: <K extends keyof SedeDraft>(field: K, value: SedeDraft[K]) => void;
  onSubmit: () => void;
  onClear: () => void;
  saving: boolean;
  isEdit: boolean;
}

const PAISES = ["Guatemala"];

const inputCls =
  "w-full px-4 py-2 text-xs text-slate-800 bg-slate-100/80 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold placeholder:text-slate-400";
const selectCls =
  "w-full px-4 py-2 text-xs text-slate-800 bg-slate-100/80 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold cursor-pointer";
const labelCls = "block text-xs font-bold text-slate-700 mb-1.5 ml-1";
const reqMark = <span className="text-rose-500 ml-0.5">*</span>;

const SedeFormPanel: React.FC<SedeFormPanelProps> = ({
  draft,
  setField,
  onSubmit,
  onClear,
  saving,
  isEdit,
}) => {
  const { departments, municipalities, loading: geoLoading } = useGeoData();
  const { uploadImage, loading: uploading } = useImageUploader();

  const [pais, setPais] = useState("Guatemala");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    const result = await uploadImage(file, `sede-${Date.now()}`);
    if (result?.url) {
      setField("url_photo", result.url);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-primary-dark text-white flex items-center justify-center shrink-0 shadow-sm">
          <FiMapPin className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Datos Generales</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Uploader de imagen */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex-1 cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center px-4 py-5 transition-all ${
              dragOver
                ? "border-primary-gold bg-amber-50/40"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
            }`}
          >
            {draft.url_photo ? (
              <div className="relative">
                <img
                  src={draft.url_photo}
                  alt="Sede"
                  className="w-20 h-20 object-cover rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setField("url_photo", null);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow"
                  title="Quitar imagen"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <FiUploadCloud className="w-7 h-7 text-slate-400 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploading ? "Subiendo imagen…" : "Arrastra y suelta tus imágenes aquí"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Formatos: JPEG, PNG · Máx. 3 MB
                </p>
              </>
            )}
          </div>

          <div className="flex sm:flex-col justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary-dark hover:opacity-90 rounded-full transition-all shadow-sm disabled:opacity-60 whitespace-nowrap active:scale-95"
            >
              {uploading ? "Subiendo…" : "Subir Imagen"}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Nombre */}
        <div>
          <label className={labelCls}>Nombre de la Sede {reqMark}</label>
          <input
            className={inputCls}
            value={draft.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Nombre de la sede"
          />
        </div>

        {/* Zona */}
        <div>
          <label className={labelCls}>Zona {reqMark}</label>
          <input
            className={inputCls}
            value={draft.zone}
            onChange={(e) => setField("zone", e.target.value)}
            placeholder="Zona"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className={labelCls}>Dirección Completa {reqMark}</label>
          <input
            className={inputCls}
            value={draft.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="Dirección completa"
          />
        </div>

        {/* Ubicación administrativa */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-3">
            <FiMapPin className="w-4 h-4 text-primary-gold" />
            <h3 className="text-sm font-bold text-slate-800">Ubicación Administrativa</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>País {reqMark}</label>
              <select
                className={`${selectCls} appearance-none`}
                value={pais}
                onChange={(e) => setPais(e.target.value)}
              >
                {PAISES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Departamento {reqMark}</label>
              <select
                className={`${selectCls} appearance-none`}
                value={draft.department}
                disabled={geoLoading || !pais}
                onChange={(e) => {
                  setField("department", e.target.value);
                  setField("municipality", "");
                }}
              >
                <option value="">Seleccione Departamento</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Municipio {reqMark}</label>
              <select
                className={`${selectCls} appearance-none`}
                value={draft.municipality}
                disabled={!draft.department}
                onChange={(e) => setField("municipality", e.target.value)}
              >
                <option value="">Seleccione Municipio</option>
                {draft.department &&
                  municipalities[draft.department]?.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Geolocalización */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-3">
            <FiGlobe className="w-4 h-4 text-primary-gold" />
            <h3 className="text-sm font-bold text-slate-800">Geolocalización</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Latitud", value: draft.latitude },
              { label: "Longitud", value: draft.length },
            ].map((g) => (
              <div
                key={g.label}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
              >
                <p className="text-xs font-bold text-slate-600">{g.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                  {g.value || "—"}
                </p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[10px] font-medium text-amber-700 border border-amber-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-gold" />
                  Automático
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-normal text-slate-400 mt-2 ml-1">
            Coloca el pin en el mapa y presiona “Aceptar” para llenar estos campos.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
          Limpiar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-2.5 text-xs font-bold text-white bg-primary-dark hover:opacity-90 rounded-full transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] disabled:opacity-60 active:scale-95"
        >
          <FiSave className="w-3.5 h-3.5" />
          {saving ? "Guardando…" : isEdit ? "Actualizar" : "Grabar"}
        </button>
      </div>
    </div>
  );
};

export default SedeFormPanel;
