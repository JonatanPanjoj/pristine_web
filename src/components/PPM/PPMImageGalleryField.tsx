import React from 'react';
import { FiCamera, FiUpload, FiX, FiStar } from 'react-icons/fi';
import { useImageUploader } from '../uploadImage/hooks/useImageUploader';

interface PPMImageGalleryFieldProps {
  label: string;
  helperText?: string;
  urls: string[];
  namePrefix: string;
  onChange: (urls: string[]) => void;
}

// Galería de imágenes del activo: admite varias fotos, la primera es la portada.
// Sube cada archivo al almacenamiento de la app y guarda solo las URLs.
export const PPMImageGalleryField: React.FC<PPMImageGalleryFieldProps> = ({
  label,
  helperText,
  urls,
  namePrefix,
  onChange,
}) => {
  const { uploadImage, loading, error } = useImageUploader();

  const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const uploaded = await Promise.all(files.map((file) => uploadImage(file, namePrefix)));
    const newUrls = uploaded.map((result) => result?.url).filter((url): url is string => Boolean(url));
    if (newUrls.length > 0) onChange([...urls, ...newUrls]);

    event.target.value = ''; // permite volver a subir el mismo archivo
  };

  const removeAt = (index: number) => onChange(urls.filter((_, i) => i !== index));

  const makeCover = (index: number) => {
    const next = [...urls];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        {urls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {urls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className={`relative w-24 h-24 rounded-2xl overflow-hidden border shadow-sm shrink-0 ${
                  index === 0 ? 'border-primary-gold ring-2 ring-primary-gold/40' : 'border-slate-200'
                }`}
              >
                <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />

                {index === 0 ? (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-primary-gold text-white text-[9px] font-bold">
                    Portada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    title="Usar como portada"
                    className="absolute bottom-1 left-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-primary-gold"
                  >
                    <FiStar className="w-3 h-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  title="Quitar fotografía"
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {urls.length === 0 && (
          <div className="w-24 h-24 rounded-2xl bg-slate-200/70 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300">
            <FiCamera className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Sin fotos</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-gold text-white rounded-full font-bold text-xs cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-sm">
            <FiUpload className="w-3.5 h-3.5" />
            <span>{loading ? 'Subiendo…' : urls.length > 0 ? 'Añadir más fotos' : 'Subir fotos'}</span>
            <input type="file" accept="image/*" multiple onChange={handleFilesChange} disabled={loading} className="hidden" />
          </label>
          {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
          {error && <p className="text-[11px] font-semibold text-danger-700">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default PPMImageGalleryField;
