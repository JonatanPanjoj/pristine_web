import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { FaSave } from 'react-icons/fa';
import { MdRefresh, MdDelete } from 'react-icons/md';
import { FiX, FiCalendar, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import * as Yup from 'yup';
import useCreateSchedule from '../hooks/programmings/useCreateSchedule';
import useEnabledSchedules from '../hooks/programmings/useEnabledSchedules';
import { useToggleScheduleStatus } from '../hooks/programmings/useToggleScheduleStatus';
import { useEditSchedule } from '../hooks/programmings/useEditSchedule';
import { useSectorsBySedeId } from '../hooks/useSectorsBySedeId';
import { useAreasBySectorId } from '../hooks/useAreasBySectorId';
import { ChecklistSchedule, ChecklistActiveDays } from '../../../models/ChecklistSchedule';
import { resolveScheduleLocationMaps } from '../../../services/scheduleLocationNames';
import { ExitoCard } from '../../../components/ExitoCard';
import ReportCard from '../../../components/ReportCard';
import useEnabledSedesFromCache from '../../../components/sedesEnabled/hooks/useEnabledSedesFromCache';
import { syncMissingRevisionsAdapter } from '../adapters/programmings/syncMissingRevisionsAdapter';
import ModalPortal from '../../../components/ModalPortal';

interface ScheduleFormProps { checklistId: string; onScheduleChange?: () => void; }

const DAY_KEYS: (keyof ChecklistActiveDays)[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DAY_SHORT  = ['L','M','X','J','V','S','D'];
const defaultDays: ChecklistActiveDays = {
  monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
};

const getActiveDaysString = (d?: ChecklistActiveDays) => {
  if (!d) return '—';
  return DAY_KEYS.filter(k => d[k]).map(k => DAY_SHORT[DAY_KEYS.indexOf(k)]).join(' · ') || '—';
};

interface ScheduleRow extends ChecklistSchedule { diasVisibles: string; sedeName: string; sectorName: string; areaName: string; }

// Enriquece una lista de schedules con nombres de sede/sector/área por LOTES
// (una sola resolución para toda la lista, no 3 getDoc por fila).
const enrichSchedules = async (list: ChecklistSchedule[]): Promise<ScheduleRow[]> => {
  const { sedeMap, sectorMap, areaMap } = await resolveScheduleLocationMaps(list);
  return list.map((s) => {
    const sId = s.sedeId || (s as any).sede_id || '';
    const secId = s.sectorId || (s as any).sector_id || '';
    const aId = s.areaId !== undefined ? s.areaId : (s as any).area_id;
    return {
      ...s,
      sedeId: sId,
      sectorId: secId,
      areaId: aId,
      diasVisibles: getActiveDaysString(s.activeDays),
      sedeName: sedeMap[sId] || sId,
      sectorName: sectorMap[secId] || secId,
      areaName: areaMap[aId] || String(aId ?? '—'),
    };
  });
};

const fieldClass = "w-full py-2.5 px-4 text-sm bg-slate-100 border-0 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed";
const GOLD_BTN = 'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-primary-gold hover:opacity-95 text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)] transition-all active:scale-95 disabled:opacity-50';
const SLATE_BTN = 'px-6 py-2.5 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95';

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-xs font-semibold text-neutral-700 mb-1">
    {text}{required && <span className="text-danger-500 ml-0.5">*</span>}
  </label>
);
const DayPill: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <button type="button" onClick={onChange}
    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${checked ? 'bg-primary-gold text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
    {label}
  </button>
);

const ScheduleForm: React.FC<ScheduleFormProps> = ({ checklistId, onScheduleChange }) => {
  const { addNewSchedule, loading: createLoading, error: createError } = useCreateSchedule();
  const { schedules, loading: schedulesLoading, error: schedulesError } = useEnabledSchedules(checklistId);
  const { toggleStatus, loading: toggleLoading } = useToggleScheduleStatus();
  const { editSchedule, loading: editLoading } = useEditSchedule();
  const { sedes, loading: sedesLoading } = useEnabledSedesFromCache();

  const [localSchedules,   setLocalSchedules]   = useState<ScheduleRow[]>([]);
  const [showSuccessCard,  setShowSuccessCard]  = useState(false);
  const [success,          setSuccess]          = useState(false);
  const [message,          setMessage]          = useState('');
  const [editModalOpen,    setEditModalOpen]    = useState(false);
  const [currentSchedule,  setCurrentSchedule]  = useState<ChecklistSchedule | null>(null);
  const [selectedSedeId,   setSelectedSedeId]   = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [isTranslating,    setIsTranslating]    = useState(false);

  const { sectors, loading: sectorsLoading } = useSectorsBySedeId(selectedSedeId);
  const { areas,   loading: areasLoading   } = useAreasBySectorId(selectedSectorId);

  useEffect(() => {
    if (!schedules) return;
    const load = async () => { setIsTranslating(true); setLocalSchedules(await enrichSchedules(schedules)); setIsTranslating(false); };
    load();
  }, [schedules]);

  const handleDelete = async (id: string) => {
    const result = await toggleStatus(id);
    if (result) {
      setLocalSchedules(prev => prev.filter(s => s.id !== id));
      setSuccess(true);
      setMessage('Schedule eliminado.');
      setShowSuccessCard(true);
      onScheduleChange?.();
    }
  };

  const handleCreateSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    setSubmitting(true);
    try {
      const data: Omit<ChecklistSchedule, 'id'> = {
        checklistId, checklistName: '',
        sedeId: values.sedeId, sectorId: values.sectorId, areaId: Number(values.areaId),
        startTime: values.startTime, endTime: values.endTime, observations: values.observations,
        isEnabled: true,
        activeDays: { monday: values.monday, tuesday: values.tuesday, wednesday: values.wednesday, thursday: values.thursday, friday: values.friday, saturday: values.saturday, sunday: values.sunday },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const result = await addNewSchedule(data);
      if (result.success && result.newScheduleId) {
        const [enriched] = await enrichSchedules([{ ...data, id: result.newScheduleId }]);
        setLocalSchedules(prev => [...prev, enriched]);
        
        // Auto-generar revisiones faltantes del día si aplica a hoy
        try {
          await syncMissingRevisionsAdapter();
        } catch (syncErr) {
          console.warn('Auto-sync revisions warning:', syncErr);
        }

        setSuccess(true);
        setMessage('Schedule creado y revisiones actualizadas con éxito.');
        setShowSuccessCard(true);
        onScheduleChange?.();
        resetForm();
        setSelectedSedeId('');
        setSelectedSectorId('');
      }
    } catch { setSuccess(false); setMessage('Error al crear el schedule.'); setShowSuccessCard(true); }
    finally { setSubmitting(false); }
  };

  const handleEditSubmit = async (values: Partial<ChecklistSchedule>) => {
    if (!currentSchedule) return;
    const updated: ChecklistSchedule = { ...currentSchedule, ...values, updatedAt: new Date().toISOString() };
    const result = await editSchedule(updated);
    if (result.success) {
      const [enriched] = await enrichSchedules([updated]);
      setLocalSchedules(prev => prev.map(s => s.id === updated.id ? enriched : s));
      setEditModalOpen(false);
      setSuccess(true);
      setMessage(result.message);
      setShowSuccessCard(true);
      onScheduleChange?.();
    }
  };

  const cellCls = 'bg-[#FAFAFA] py-2.5 px-4 text-sm group-hover:bg-white transition-colors whitespace-nowrap';
  const th = 'bg-primary-gold text-white font-bold text-xs uppercase tracking-wider py-2 px-4 whitespace-nowrap';

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* ── Form ── */}
      <ReportCard title="Nueva programación">
        <Formik
          initialValues={{ sedeId: '', sectorId: '', areaId: 0, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false, startTime: '06:00:00', endTime: '22:00:00', observations: '' }}
          validationSchema={Yup.object({ sedeId: Yup.string().required(), sectorId: Yup.string().required(), startTime: Yup.string().required(), endTime: Yup.string().required() })}
          onSubmit={handleCreateSubmit}
        >
          {({ isSubmitting, setFieldValue, values, resetForm }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label text="Sede" required />
                <select value={values.sedeId} onChange={e => { setFieldValue('sedeId', e.target.value); setSelectedSedeId(e.target.value); setFieldValue('sectorId',''); setFieldValue('areaId',0); }} disabled={sedesLoading} className={fieldClass}>
                  <option value="">{sedesLoading ? 'Cargando sedes...' : 'Seleccionar sede'}</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><Label text="Sector" required />
                <select value={values.sectorId} onChange={e => { setFieldValue('sectorId', e.target.value); setSelectedSectorId(e.target.value); setFieldValue('areaId',0); }} disabled={!values.sedeId || sectorsLoading} className={fieldClass}>
                  <option value="">{sectorsLoading ? 'Cargando...' : 'Seleccionar sector'}</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><Label text="Área" />
                <select value={values.areaId} onChange={e => setFieldValue('areaId', Number(e.target.value))} disabled={!values.sectorId || areasLoading} className={fieldClass}>
                  <option value={0}>{areasLoading ? 'Cargando...' : 'Seleccionar área'}</option>
                  {areas.map(a => <option key={a.area_id as string} value={a.area_id as number}>{a.name}</option>)}
                </select>
              </div>
              <div><Label text="Observaciones" />
                <input type="text" value={values.observations} onChange={e => setFieldValue('observations', e.target.value)} placeholder="Opcional..." className={fieldClass} />
              </div>
              <div><Label text="Hora de inicio" required />
                <input type="time" value={values.startTime.slice(0,5)} onChange={e => setFieldValue('startTime',`${e.target.value}:00`)} className={fieldClass} />
              </div>
              <div><Label text="Hora de fin" required />
                <input type="time" value={values.endTime.slice(0,5)} onChange={e => setFieldValue('endTime',`${e.target.value}:00`)} className={fieldClass} />
              </div>
              <div className="md:col-span-2"><Label text="Días activos" />
                <div className="flex flex-wrap gap-2 mt-1">
                  {DAY_KEYS.map((key, i) => (
                    <DayPill key={key} label={DAY_LABELS[i]} checked={values[key as keyof typeof values] as boolean} onChange={() => setFieldValue(key, !values[key as keyof typeof values])} />
                  ))}
                </div>
              </div>
              {createError && <p className="md:col-span-2 text-xs text-danger-700">{createError}</p>}
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => { resetForm(); setSelectedSedeId(''); setSelectedSectorId(''); }} className={SLATE_BTN}>
                  Limpiar
                </button>
                <button type="submit" disabled={isSubmitting || createLoading} className={GOLD_BTN}>
                  {isSubmitting || createLoading ? <MdRefresh className="animate-spin h-4 w-4" /> : <><FaSave size={12} /> Guardar programación</>}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </ReportCard>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 border-spacing-x-0">
            <thead>
              <tr>
                <th className={`${th} first:rounded-l-full`}>Sede</th>
                <th className={th}>Sector</th>
                <th className={th}>Área</th>
                <th className={th}>Días</th>
                <th className={th}>Horario</th>
                <th className={th}>Observaciones</th>
                <th className={`${th} text-right last:rounded-r-full`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schedulesLoading || isTranslating ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className={`bg-[#FAFAFA] py-2.5 px-4 ${j === 0 ? 'first:rounded-l-full' : ''} ${j === 6 ? 'last:rounded-r-full' : ''}`}><div className="h-4 bg-neutral-200 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : schedulesError ? (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-danger-700">{schedulesError}</td></tr>
              ) : localSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <FiCalendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Sin programaciones aún</p>
                    <p className="text-xs text-slate-400 mt-1">Agrega la primera programación usando el formulario de arriba.</p>
                  </td>
                </tr>
              ) : (
                localSchedules.map((s, idx) => (
                  <motion.tr key={s.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="group">
                    <td className={`${cellCls} first:rounded-l-full font-medium text-slate-800`}>{s.sedeName}</td>
                    <td className={`${cellCls} text-slate-600`}>{s.sectorName}</td>
                    <td className={`${cellCls} text-slate-600`}>{s.areaName}</td>
                    <td className={cellCls}>
                      <span className="text-xs font-bold text-action-700 bg-action-200/60 px-2.5 py-0.5 rounded-full">{s.diasVisibles}</span>
                    </td>
                    <td className={`${cellCls} text-xs text-slate-500 font-medium`}>
                      {s.startTime?.slice(0,5)} – {s.endTime?.slice(0,5)}
                    </td>
                    <td className={`${cellCls} text-xs text-slate-500 max-w-[140px] truncate`}>{s.observations || '—'}</td>
                    <td className={`${cellCls} last:rounded-r-full`}>
                      <div className="flex justify-end items-center gap-1.5">
                        <button onClick={() => { setCurrentSchedule(s); setSelectedSedeId(s.sedeId); setSelectedSectorId(s.sectorId); setEditModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-primary-gold hover:bg-primary-gold/10 rounded-lg transition-colors active:scale-95" title="Editar">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-200/30 rounded-lg transition-colors active:scale-95" title="Eliminar">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!schedulesLoading && !isTranslating && localSchedules.length > 0 && (
          <div className="px-2 pt-3 mt-2 border-t border-slate-100 text-sm text-slate-500">
            {localSchedules.length} {localSchedules.length === 1 ? 'programación' : 'programaciones'}
          </div>
        )}
      </div>

      {editModalOpen && currentSchedule && (
        <ScheduleEditModal schedule={currentSchedule} sedes={sedes} onClose={() => setEditModalOpen(false)} onSubmit={handleEditSubmit} loading={editLoading} />
      )}
      {showSuccessCard && (
        <ExitoCard onClose={() => setShowSuccessCard(false)} loading={createLoading || toggleLoading || editLoading} success={success} message={message} />
      )}
    </div>
  );
};

export default ScheduleForm;

// ── Edit modal ────────────────────────────────────────────────────────────────
const ScheduleEditModal: React.FC<{
  schedule: ChecklistSchedule; sedes: any[];
  onClose: () => void; onSubmit: (v: Partial<ChecklistSchedule>) => void; loading?: boolean;
}> = ({ schedule, sedes, onClose, onSubmit, loading }) => {
  const [selSedeId,   setSelSedeId]   = useState(schedule.sedeId);
  const [selSectorId, setSelSectorId] = useState(schedule.sectorId);
  const { sectors, loading: sectorsLoading } = useSectorsBySedeId(selSedeId);
  const { areas,   loading: areasLoading   } = useAreasBySectorId(selSectorId);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
            <h3 className="text-sm font-bold text-slate-800">Editar programación</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><FiX size={16} /></button>
          </div>
          {(() => {
            const aDays = schedule.activeDays || defaultDays;
            return (
              <Formik
                initialValues={{
                  sedeId: schedule.sedeId || (schedule as any).sede_id || '',
                  sectorId: schedule.sectorId || (schedule as any).sector_id || '',
                  areaId: schedule.areaId !== undefined ? schedule.areaId : ((schedule as any).area_id ?? 0),
                  monday: aDays.monday ?? false,
                  tuesday: aDays.tuesday ?? false,
                  wednesday: aDays.wednesday ?? false,
                  thursday: aDays.thursday ?? false,
                  friday: aDays.friday ?? false,
                  saturday: aDays.saturday ?? false,
                  sunday: aDays.sunday ?? false,
                  startTime: schedule.startTime || '08:00:00',
                  endTime: schedule.endTime || '17:00:00',
                  observations: schedule.observations ?? '',
                }}
                validationSchema={Yup.object({ sedeId: Yup.string().required(), sectorId: Yup.string().required(), startTime: Yup.string().required(), endTime: Yup.string().required() })}
                onSubmit={values => onSubmit({ sedeId: values.sedeId, sectorId: values.sectorId, areaId: Number(values.areaId), startTime: values.startTime, endTime: values.endTime, observations: values.observations, activeDays: { monday: values.monday, tuesday: values.tuesday, wednesday: values.wednesday, thursday: values.thursday, friday: values.friday, saturday: values.saturday, sunday: values.sunday } })}
              >
                {({ isSubmitting, setFieldValue, values }) => (
                  <Form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label text="Sede" required />
                      <select value={values.sedeId} onChange={e => { setFieldValue('sedeId', e.target.value); setSelSedeId(e.target.value); setFieldValue('sectorId',''); setFieldValue('areaId',0); }} className={fieldClass}>
                        {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div><Label text="Sector" required />
                      <select value={values.sectorId} onChange={e => { setFieldValue('sectorId', e.target.value); setSelSectorId(e.target.value); setFieldValue('areaId',0); }} disabled={sectorsLoading} className={fieldClass}>
                        <option value="">{sectorsLoading ? 'Cargando...' : 'Seleccionar'}</option>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div><Label text="Área" />
                      <select value={values.areaId} onChange={e => setFieldValue('areaId', Number(e.target.value))} disabled={areasLoading} className={fieldClass}>
                        <option value={0}>{areasLoading ? 'Cargando...' : 'Seleccionar'}</option>
                        {areas.map(a => <option key={a.area_id as string} value={a.area_id as number}>{a.name}</option>)}
                      </select>
                    </div>
                    <div><Label text="Observaciones" />
                      <input type="text" value={values.observations} onChange={e => setFieldValue('observations', e.target.value)} className={fieldClass} />
                    </div>
                    <div><Label text="Hora de inicio" required />
                      <input type="time" value={(values.startTime || '08:00').slice(0,5)} onChange={e => setFieldValue('startTime',`${e.target.value}:00`)} className={fieldClass} />
                    </div>
                    <div><Label text="Hora de fin" required />
                      <input type="time" value={(values.endTime || '17:00').slice(0,5)} onChange={e => setFieldValue('endTime',`${e.target.value}:00`)} className={fieldClass} />
                    </div>
                <div className="md:col-span-2"><Label text="Días activos" />
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DAY_KEYS.map((key, i) => (
                      <DayPill key={key} label={DAY_LABELS[i]} checked={values[key as keyof typeof values] as boolean} onChange={() => setFieldValue(key, !values[key as keyof typeof values])} />
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                  <button type="button" onClick={onClose} className={SLATE_BTN}>Cancelar</button>
                  <button type="submit" disabled={isSubmitting || loading} className={GOLD_BTN}>
                    {isSubmitting || loading ? <MdRefresh className="animate-spin h-4 w-4" /> : <><FaSave size={12} /> Guardar</>}
                  </button>
                </div>
                  </Form>
                )}
              </Formik>
            );
          })()}
        </div>
      </div>
    </ModalPortal>
  );
};
