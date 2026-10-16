// views/RevisionDetailView.tsx
// Ficha de la revisión (solo lectura). Se abre en una PESTAÑA NUEVA desde el
// Gestor de Revisiones (botón "ver"). Layout tipo ficha: tarjetas de preguntas
// con la respuesta marcada, evidencia, firma, observaciones y un panel lateral
// "Resumen de la tarea". Diseño según las leyes del design system (tarjetas
// flotantes, acento dorado, tokens semánticos, framer-motion).

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetRevisionById } from "../hooks/useGetRevisionById";
import { ChecklistRevision, ChecklistRevisionAnswer, ChecklistRevisionStatus } from "../../../models/ChecklistRevision";
import Lightbox from "../components/Lightbox";
import { ExecutionLocationCard } from "../components/ExecutionLocationCard";
import { resolveExecutionCoordinates } from "../utils/executionCoordinates";
import {
  HiOutlineFolder, HiOutlineLocationMarker, HiOutlineClipboardList, HiOutlineArrowLeft,
  HiOutlineZoomIn, HiOutlinePhotograph, HiOutlineUser, HiOutlineUserCircle, HiOutlineTag,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlinePencilAlt,
  HiOutlineCalendar, HiOutlineLightningBolt, HiOutlineCloudUpload,
} from "react-icons/hi";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

type AnswerValue = ChecklistRevisionAnswer["value"];

const ANSWER: Record<AnswerValue, { label: string; active: string }> = {
  yes: { label: "Sí",        active: "bg-success-500 text-white border-success-500" },
  na:  { label: "No aplica", active: "bg-slate-700 text-white border-slate-700" },
  no:  { label: "No",        active: "bg-danger-500 text-white border-danger-500" },
};
const ANSWER_ORDER: AnswerValue[] = ["yes", "na", "no"];

const statusStyle: Record<ChecklistRevisionStatus, { label: string; cls: string; dot: string }> = {
  pending:     { label: "Pendiente",   cls: "bg-attention-200/50 text-attention-700 border-attention-200", dot: "bg-attention-500" },
  in_progress: { label: "En progreso", cls: "bg-action-200/50 text-action-700 border-action-200",          dot: "bg-action-500" },
  completed:   { label: "Completada",  cls: "bg-success-200/50 text-success-700 border-success-200",        dot: "bg-success-500" },
  expired:     { label: "Expirada",    cls: "bg-rose-200/50 text-rose-700 border-rose-200",               dot: "bg-rose-500" },
};

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }) : "—";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" }) : "—";

/** Fecha y hora juntas: la sincronización se lee como un instante, no como un día. */
const formatDateTime = (iso: string | null) =>
  iso ? `${formatDate(iso)}, ${formatTime(iso)}` : "—";

/**
 * Tiempo que tomó la ejecución. `durationSeconds` lo escribe el cierre de la
 * revisión; en las que vienen sin él se deduce del horario, y si la revisión
 * sigue abierta no hay nada que totalizar todavía.
 */
const formatDuration = (durationSeconds: number | null, startDate: string | null, endDate: string | null) => {
  const seconds = durationSeconds ?? elapsedSeconds(startDate, endDate);
  if (seconds === null) return endDate ? "—" : "En curso";
  return describeSeconds(seconds);
};

const elapsedSeconds = (startDate: string | null, endDate: string | null): number | null => {
  if (!startDate || !endDate) return null;
  const elapsed = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000;
  return Number.isFinite(elapsed) && elapsed >= 0 ? Math.round(elapsed) : null;
};

const describeSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds} s`;
};

/* ── Píldoras de respuesta (marcada = activa) ─────────────────────────────── */
const AnswerPills: React.FC<{ value: AnswerValue }> = ({ value }) => (
  <div className="flex flex-wrap gap-2">
    {ANSWER_ORDER.map((k) => (
      <span
        key={k}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
          value === k ? ANSWER[k].active : "bg-white text-slate-400 border-slate-200"
        }`}
      >
        {ANSWER[k].label}
      </span>
    ))}
  </div>
);

/* ── Tarjeta de pregunta ──────────────────────────────────────────────────── */
const QuestionCard: React.FC<{ index: number; answer: ChecklistRevisionAnswer }> = ({ index, answer }) => (
  <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4">
    <p className="text-sm font-semibold text-slate-800 mb-3 leading-snug">{index}. {answer.questionText}</p>
    <AnswerPills value={answer.value} />
    {answer.observations && <p className="text-xs text-slate-500 mt-3">{answer.observations}</p>}
  </div>
);

/* ── Fila del resumen ─────────────────────────────────────────────────────── */
const SummaryRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-primary-gold">{icon}</span>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
    <div className="bg-slate-50 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 truncate">{value || "—"}</div>
  </div>
);

export const RevisionDetailView: React.FC = () => {
  const { revisionId } = useParams<{ revisionId: string }>();
  const navigate = useNavigate();
  const { getRevisionById } = useGetRevisionById();

  const [revision, setRevision] = useState<ChecklistRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchedId = useRef<string | null>(null);

  useEffect(() => {
    if (!revisionId || fetchedId.current === revisionId) return;
    fetchedId.current = revisionId;
    const fetch = async () => {
      try {
        const result = await getRevisionById(revisionId);
        if (!result) { setError("No se encontró la revisión."); return; }
        setRevision(result);
      } catch {
        setError("No se pudo cargar la revisión. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [revisionId]);

  // En pestaña nueva no hay historial: cierra; si se abrió normal, navega atrás.
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-gold animate-spin" />
        <span className="text-sm font-semibold">Cargando ficha…</span>
      </div>
    );
  }

  if (error || !revision) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <HiOutlineClipboardList className="w-12 h-12 text-danger-500" />
        <p className="text-sm font-semibold text-slate-700">{error ?? "Revisión no disponible."}</p>
        <button onClick={handleBack}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary-gold hover:opacity-95 active:scale-95 transition-all shadow-[0_4px_12px_rgba(221,152,3,0.25)]">
          Volver
        </button>
      </div>
    );
  }

  // Defensivo ante revisiones legacy/parciales (campos faltantes)
  const location  = (revision.location  ?? {}) as Partial<ChecklistRevision["location"]>;
  const checklist = (revision.checklist ?? {}) as Partial<ChecklistRevision["checklist"]>;
  const answers   = revision.answers ?? [];
  const { signatureUrl, PhotoUrl, status, user, supervisor, observations, startDate, endDate,
          durationSeconds, createdAt } = revision;

  const st = statusStyle[status] ?? {
    label: "Desconocido",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  const startLocation = revision.startLocation || revision.start_location;
  const endLocation = revision.endLocation || revision.end_location;
  const coordinates = resolveExecutionCoordinates(revision);

  const total = answers.length;
  const answered = answers.filter((a) => !!a.value).length;

  const pendientes: string[] = [];
  if (answered < total) pendientes.push(`${total - answered} pregunta${total - answered !== 1 ? "s" : ""} por responder`);
  if (!signatureUrl) pendientes.push("Falta firma");
  if (!PhotoUrl) pendientes.push("Falta adjuntar foto");
  const showPendientes = status !== "completed" && pendientes.length > 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col p-6 md:p-8">
      {/* Cabecera flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <HiOutlineFolder className="w-6 h-6 mr-3 text-primary-gold" />
              Ficha
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <HiOutlineLocationMarker className="w-4 h-4 text-slate-400" />
              {location.areaName || location.sedeName || "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${st.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
              {status === "in_progress" && startDate && ` · desde ${new Date(startDate).toLocaleDateString("es-GT")}`}
            </span>
            <button onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white bg-primary-gold shadow-[0_4px_12px_rgba(221,152,3,0.25)] hover:opacity-95 active:scale-95 transition-all shrink-0">
              <HiOutlineArrowLeft className="w-4 h-4" />
              Atrás
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preguntas */}
          <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {answers.length === 0 ? (
              <p className="sm:col-span-2 text-center text-sm text-slate-400 py-12 rounded-[20px] border border-dashed border-slate-200 bg-white">
                No hay preguntas registradas en esta revisión.
              </p>
            ) : (
              answers.map((answer, i) => (
                <QuestionCard key={answer.questionId} index={i + 1} answer={answer} />
              ))
            )}
          </motion.div>

          {/* Evidencia — una sola foto */}
          <motion.div variants={cardVariants} className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
              <HiOutlinePhotograph className="w-5 h-5 text-primary-gold" />
              Evidencia <span className="text-xs font-medium text-slate-400">(Obligatorio)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Foto del área.</p>
            {PhotoUrl ? (
              <button type="button" onClick={() => setLightboxUrl(PhotoUrl)} title="Ver foto"
                className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold/40">
                <img src={PhotoUrl} alt="Evidencia" className="w-full h-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-primary-dark/0 group-hover:bg-primary-dark/30 transition-colors">
                  <HiOutlineZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ) : (
              <div className="w-full max-w-sm aspect-[4/3] rounded-2xl bg-primary flex items-center justify-center">
                <HiOutlinePhotograph className="w-10 h-10 text-white/25" />
              </div>
            )}
          </motion.div>

          {/* Punto donde se ejecutó */}
          {(startLocation || endLocation || coordinates) && (
            <motion.div variants={cardVariants}>
              <ExecutionLocationCard
                startLocation={startLocation}
                endLocation={endLocation}
                coordinates={coordinates || undefined}
                placeName={`${location.sedeName || "—"}: ${location.areaName || "—"}`}
              />
            </motion.div>
          )}

          {/* Observaciones */}
          <motion.div variants={cardVariants} className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Supervisor y observaciones adicionales</h3>
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600 min-h-[80px]">
              {observations || <span className="text-slate-400">Sin observaciones registradas.</span>}
            </div>
          </motion.div>

          {/* Firma */}
          <motion.div variants={cardVariants} className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <HiOutlinePencilAlt className="w-5 h-5 text-primary-gold" />
              Firma
            </h3>
            {signatureUrl ? (
              <button type="button" onClick={() => setLightboxUrl(signatureUrl)} title="Ver firma"
                className="relative w-full max-w-xs aspect-[3/1] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold/40">
                <img src={signatureUrl} alt="Firma" className="w-full h-full object-contain" />
              </button>
            ) : (
              <div className="w-full max-w-xs aspect-[3/1] rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                <span className="text-xs text-slate-400">Sin firma registrada</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Panel lateral: Resumen de la tarea */}
        <motion.div variants={cardVariants} className="lg:col-span-1">
          <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <HiOutlineClipboardList className="w-5 h-5 text-primary-gold" />
              Resumen de la tarea
            </h3>

            <SummaryRow icon={<HiOutlineUser className="w-4 h-4" />}       label="Responsable"          value={user?.name ?? "—"} />
            <SummaryRow icon={<HiOutlineUserCircle className="w-4 h-4" />} label="Encargado/a"          value={supervisor?.name ?? "—"} />
            <SummaryRow icon={<HiOutlineLocationMarker className="w-4 h-4" />} label="Ubicación"        value={`${location.sedeName || "—"}: ${location.areaName || "—"}`} />
            <SummaryRow icon={<HiOutlineTag className="w-4 h-4" />}        label="Categoría"            value={checklist.categoryName} />
            <SummaryRow icon={<HiOutlineClipboardList className="w-4 h-4" />} label="Lista"             value={checklist.name} />
            <SummaryRow icon={<HiOutlineCalendar className="w-4 h-4" />}   label="Fecha de ejecución"   value={formatDate(startDate)} />
            <SummaryRow icon={<HiOutlineClock className="w-4 h-4" />}      label="Horario de ejecución" value={`${formatTime(startDate)} – ${endDate ? formatTime(endDate) : "En curso"}`} />
            <SummaryRow icon={<HiOutlineLightningBolt className="w-4 h-4" />} label="Tiempo total de ejecución" value={formatDuration(durationSeconds, startDate, endDate)} />
            <SummaryRow icon={<HiOutlineCloudUpload className="w-4 h-4" />} label="Sincronización"      value={formatDateTime(createdAt)} />

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineCheckCircle className="w-4 h-4 text-primary-gold" />
                <span className="text-xs font-semibold text-slate-500">Progreso</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{answered} de {total} completadas</p>
            </div>

            {showPendientes && (
              <div className="rounded-2xl bg-attention-200/40 border border-attention-200 p-4">
                <p className="text-sm font-bold text-attention-700 flex items-center gap-1.5 mb-2">
                  <HiOutlineExclamation className="w-4 h-4" /> Pendientes:
                </p>
                <ul className="space-y-1">
                  {pendientes.map((p, i) => (
                    <li key={i} className="text-xs font-medium text-attention-700">· {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </motion.div>
  );
};

export default RevisionDetailView;
