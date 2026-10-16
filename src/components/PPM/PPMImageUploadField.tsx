import React from 'react';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import { useImageUploader } from '../uploadImage/hooks/useImageUploader';

interface PPMImageUploadFieldProps {
  label: string;
  helperText?: string;
  value: string;
  namePrefix: string;
  onChange: (url: string) => void;
}

// Campo de imagen del módulo PPM: sube el archivo al almacenamiento de la app y
// guarda únicamente la URL resultante (nunca el binario en Firestore).
export const PPMImageUploadField: React.FC<PPMImageUploadFieldProps> = ({
  label,
  helperText,
  value,
  namePrefix,
  onChange
}) => {
  const { uploadImage, loading, error } = useImageUploader();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploaded = await uploadImage(file, namePrefix);
    if (uploaded?.url) onChange(uploaded.url);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        {value ? (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
              title="Quitar imagen"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-slate-200/70 flex flex-col items-center justify-center text-slate-400 shrink-0 border border-dashed border-slate-300">
            <FiCamera className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Sin imagen</span>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-gold text-white rounded-full font-bold text-xs cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-sm">
            <FiUpload className="w-3.5 h-3.5" />
            <span>{loading ? 'Subiendo…' : 'Subir imagen'}</span>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} className="hidden" />
          </label>
          {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
          {error && <p className="text-[11px] font-semibold text-danger-700">{error}</p>}
        </div>
      </div>
    </div>
  );
};
