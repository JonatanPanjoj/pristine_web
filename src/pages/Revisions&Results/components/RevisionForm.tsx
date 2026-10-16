// RevisionForm.tsx
// Zona de evidencia estilo "Dropzone limpia" (opción 1):
//   - Vacío: área punteada con "Arrastra o haz clic" (clic abre el selector de archivos)
//   - Con imagen: miniatura + nombre + peso + botón "Quitar"
//   - Clic en la miniatura → abre la imagen completa en el visor (Lightbox)
//
// FIX: el <input file> ahora va DENTRO del <label> — antes estaba fuera y por eso
//      el clic no abría el selector de archivos.
//
// NOTA: revisa la ruta del import de useImageUploader si tu carpeta difiere.

import React, { useState } from 'react';
import { ChecklistRevision, ChecklistRevisionAnswer } from '../../../models/ChecklistRevision';
import { ActiveScheduleResult } from '../adapters/getActiveSchedulesAdapter';
import { useUpdateRevision } from '../hooks/useUpdateRevision';
import { useImageUploader } from '../../../components/uploadImage/hooks/useImageUploader';
import Lightbox from '../components/Lightbox';
import {
  HiOutlineLocationMarker,
  HiOutlineClipboardList,
  HiOutlineCamera,
  HiOutlinePencilAlt,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlineExclamationCircle,
  HiOutlineCloudUpload,
  HiOutlineTrash,
  HiOutlineZoomIn,
} from 'react-icons/hi';

interface RevisionFormProps {
  revision: ChecklistRevision;
  schedule: ActiveScheduleResult;
  onSave: () => void;
  onCancel: () => void;
}

type AnswerValue = ChecklistRevisionAnswer['value'];

// Forma esperada del resultado de uploadImage (igual que el onUpload anterior)
interface UploadResult { id?: string; url: string; name?: string; date?: string; }

// ── Control segmentado de respuesta ───────────────────────────────────────────
const ANSWER_OPTIONS: {
  value: AnswerValue;
  label: string;
  icon: React.ReactNode;
  active: string;
}[] = [
  { value: 'yes', label: 'Sí',        icon: <HiOutlineCheckCircle className="w-4 h-4" />, active: 'bg-success-500 border-success-500 text-white' },
  { value: 'no',  label: 'No',        icon: <HiOutlineXCircle className="w-4 h-4" />,     active: 'bg-danger-500 border-danger-500 text-white' },
  { value: 'na',  label: 'No aplica', icon: <HiOutlineMinusCircle className="w-4 h-4" />, active: 'bg-surface-700 border-surface-700 text-white' },
];

const AnswerSegmented: React.FC<{
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}> = ({ value, onChange }) => (
  <div className="inline-flex rounded-xl border border-neutral-200 bg-surface-app p-0.5 shrink-0">
    {ANSWER_OPTIONS.map((opt) => {
      const isActive = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action-200 ${
            isActive ? opt.active + ' shadow-sm' : 'border border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ── Zona de carga (foto o firma) — estilo dropzone limpio ─────────────────────
const formatSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1_048_576).toFixed(1)} MB`;

const UploadZone: React.FC<{
  title: string;
  hint: string;
  required?: boolean;
  icon: React.ReactNode;
  value: string | null;
  onChange: (url: string | null) => void;
  customName: string;
  onView: (url: string) => void;
}> = ({ title, hint, required, icon, value, onChange, customName, onView }) => {
  const { uploadImage, deleteImage, loading, error } = useImageUploader();
  const [meta, setMeta] = useState<{ name: string; size: number; id?: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    const result = (await uploadImage(file, customName)) as UploadResult | null;
    if (result?.url) {
      setMeta({ name: file.name, size: file.size, id: result.id });
      onChange(result.url);
    }
  };

  const handleRemove = async () => {
    if (meta?.id) { try { await deleteImage(meta.id); } catch { /* noop */ } }
    setMeta(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-surface-app">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-action-500/10 text-action-500">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary leading-tight">{title}</p>
          <p className="text-xs text-neutral-400 leading-tight">{hint}</p>
        </div>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-danger-500 bg-danger-200/40 px-2 py-0.5 rounded-full">
            Obligatorio
          </span>
        )}
      </div>

      <div className="p-4">
        {!value ? (
          // ── Vacío: dropzone (el input va DENTRO del label) ───────────────
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`flex flex-col items-center justify-center gap-1.5 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              dragOver ? 'border-action-400 bg-action-200/20' : 'border-neutral-200 bg-surface-app hover:border-action-200'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {loading ? (
              <>
                <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-action-500 animate-spin" />
                <span className="text-xs text-neutral-400">Subiendo…</span>
              </>
            ) : (
              <>
                <HiOutlineCloudUpload className="w-6 h-6 text-action-400" />
                <span className="text-[13px] font-medium text-neutral-700">Arrastra o haz clic</span>
                <span className="text-[11px] text-neutral-400">PNG · JPG</span>
              </>
            )}
          </label>
        ) : (
          // ── Con imagen: miniatura + datos + quitar ──────────────────────
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onView(value)}
              title="Ver imagen completa"
              className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-action-200"
            >
              <img src={value} alt={title} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-primary-dark/0 group-hover:bg-primary-dark/30 transition-colors">
                <HiOutlineZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-neutral-900 truncate">{meta?.name ?? 'Imagen cargada'}</p>
              <p className="text-[11px] text-neutral-400 mb-2">{meta ? formatSize(meta.size) : 'Toca la miniatura para verla'}</p>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-danger-700 bg-danger-200/30 hover:bg-danger-200/50 transition-colors"
              >
                <HiOutlineTrash className="w-3.5 h-3.5" />
                Quitar
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-[11px] text-danger-600">{error}</p>}
      </div>
    </div>
  );
};

const RevisionForm: React.FC<RevisionFormProps> = ({ revision, schedule, onSave, onCancel }) => {
  const [answers, setAnswers]           = useState<ChecklistRevisionAnswer[]>(revision.answers);
  const [observations, setObservations] = useState(revision.observations);
  const [photoUrl, setPhotoUrl]         = useState<string | null>(revision.PhotoUrl);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(revision.signatureUrl);
  const [lightboxUrl, setLightboxUrl]   = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { updateRevision, loading, error } = useUpdateRevision();

  const { location, checklist } = revision;

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, value } : a)));
  };

  const handleSave = async () => {
    setErrorMessage(null);

    if (schedule.needPhoto && !photoUrl) {
      setErrorMessage('Falta la foto. Es obligatoria para cerrar esta revisión.');
      return;
    }
    if (schedule.needFirm && !signatureUrl) {
      setErrorMessage('Falta la firma. Es obligatoria para cerrar esta revisión.');
      return;
    }

    try {
      await updateRevision({
        revisionId:  revision.id,
        answers,
        observations,
        signatureUrl,
        supervisor:  revision.supervisor,
        photoUrl,
      });
      onSave();
    } catch {
      // el error queda capturado en el hook
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header sticky */}
      <header className="relative px-6 py-5 bg-primary shrink-0">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-gold" />
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 text-primary-gold shrink-0">
            <HiOutlineClipboardList className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white leading-tight truncate">{checklist.name}</h2>
            <p className="text-sm text-surface-200 leading-tight truncate">
              {location.sedeName || '—'} · {location.areaName || '—'}
            </p>
          </div>
        </div>
      </header>

      {/* Cuerpo scrolleable */}
      <div className="flex-1 overflow-y-auto modal-scrollbar px-6 py-5 space-y-6 bg-surface-app">

        {/* Ubicación + info general */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineLocationMarker className="w-4 h-4 text-action-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ubicación</h3>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-neutral-400">Sede</dt><dd className="font-medium text-primary text-right">{location.sedeName || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-400">Sector</dt><dd className="font-medium text-primary text-right">{location.sectorName || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-400">Área</dt><dd className="font-medium text-primary text-right">{location.areaName || '—'}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineClipboardList className="w-4 h-4 text-accent-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Información general</h3>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-neutral-400">Categoría</dt><dd className="font-medium text-primary text-right">{checklist.categoryName || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-400">Checklist</dt><dd className="font-medium text-primary text-right">{checklist.name || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-400">Horario</dt><dd className="font-medium text-primary text-right">{schedule.startTime} – {schedule.endTime}</dd></div>
            </dl>
          </div>
        </section>

        {/* Cuestionario */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-primary">Cuestionario</h3>
            <span className="text-xs text-neutral-400">{answers.length} pregunta{answers.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {answers.length === 0 ? (
              <p className="text-center text-sm text-neutral-400 py-8 rounded-2xl border border-dashed border-neutral-200 bg-white">
                Sin preguntas registradas.
              </p>
            ) : (
              answers.map((answer, i) => (
                <div
                  key={answer.questionId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-surface-app text-xs font-bold text-neutral-400 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-primary">{answer.questionText}</span>
                  </div>
                  <AnswerSegmented
                    value={answer.value}
                    onChange={(v) => handleAnswerChange(answer.questionId, v)}
                  />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Observaciones */}
        <section>
          <h3 className="text-sm font-bold text-primary mb-2">Observaciones</h3>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            placeholder="Anota cualquier detalle relevante de la revisión…"
            className="w-full rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-primary placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-action-200 focus:border-action-500 transition-all resize-none"
          />
        </section>

        {/* Evidencia: Foto + Firma */}
        <section>
          <h3 className="text-sm font-bold text-primary mb-3">Evidencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UploadZone
              title="Foto"
              hint="Evidencia fotográfica de la revisión"
              required={schedule.needPhoto}
              icon={<HiOutlineCamera className="w-5 h-5" />}
              value={photoUrl}
              onChange={setPhotoUrl}
              onView={setLightboxUrl}
              customName={`${revision.id}-photo`}
            />
            <UploadZone
              title="Firma"
              hint="Firma de quien cierra la revisión"
              required={schedule.needFirm}
              icon={<HiOutlinePencilAlt className="w-5 h-5" />}
              value={signatureUrl}
              onChange={setSignatureUrl}
              onView={setLightboxUrl}
              customName={`${revision.id}-firm`}
            />
          </div>
        </section>

        {/* Mensajes de estado */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-200/20 px-4 py-2.5 text-sm text-danger-700">
            <HiOutlineExclamationCircle className="w-5 h-5 shrink-0" />
            {errorMessage}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-200/20 px-4 py-2.5 text-sm text-danger-700">
            <HiOutlineExclamationCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Footer sticky */}
      <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-white shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 bg-surface-app hover:bg-neutral-200/60 transition-colors disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-action-500 hover:bg-action-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineCheckCircle className="w-4 h-4" />
          {loading ? 'Guardando…' : 'Cerrar revisión'}
        </button>
      </footer>

      {/* Visor de imagen completa */}
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
};

export default RevisionForm;
