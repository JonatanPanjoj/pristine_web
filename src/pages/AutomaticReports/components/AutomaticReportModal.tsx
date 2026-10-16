// src/pages/AutomaticReports/components/AutomaticReportModal.tsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useUpdateAutomaticReport } from "../hooks/useUpdateAutomaticReport";
import { useSedeOptions } from "../hooks/useSedeOptions";
import UserSearchSelect, { UserOption } from "./UserSearchSelect";
import SedeMultiSelect from "./SedeMultiSelect";
import ScheduleFields from "./ScheduleFields";
import { validateForm } from "./AutomaticReportForm";
import { ExitoCard } from "../../../components/ExitoCard";
import {
  AutomaticReport,
  AutomaticReportModule,
  AutomaticReportPeriod,
} from "../../../models/AutomaticReport";
import { REPORT_MODULES, getReportModuleLabel } from "../constants/reportModules";
import {
  DEFAULT_REPORT_HOUR,
  getDefaultPeriod,
  getPeriodLabel,
  getWeekDayLabel,
  isChecklistModule,
} from "../constants/reportSchedule";
import { inputCls, readonlyCls, labelCls } from "../constants/formStyles";
import { FiX, FiSave } from "react-icons/fi";
import ModalPortal from "../../../components/ModalPortal";

interface AutomaticReportModalProps {
  report: AutomaticReport;
  isOpen: boolean;
  mode: "view" | "edit";
  onClose: () => void;
  onSubmit: () => void;
}

const AutomaticReportModal: React.FC<AutomaticReportModalProps> = ({
  report,
  isOpen,
  mode,
  onClose,
  onSubmit,
}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { updateAutomaticReportById, loading } = useUpdateAutomaticReport();
  const { toOptions, toNames } = useSedeOptions();

  const isEdit = mode === "edit";

  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [email, setEmail] = useState(report.rep_correo ?? "");
  const [module, setModule] = useState<AutomaticReportModule>(report.rep_modulo ?? "checklist");
  const [period, setPeriod] = useState<AutomaticReportPeriod>(report.rep_periodo ?? "dia");
  const [hour, setHour] = useState(report.rep_hora ?? DEFAULT_REPORT_HOUR);
  const [weekDay, setWeekDay] = useState<number | null>(report.rep_dia_semana ?? 1);
  const [allSedes, setAllSedes] = useState(report.rep_todas_sedes ?? true);
  // Se guardan los IDs y las opciones se resuelven en cada render, para que los
  // nombres aparezcan en cuanto el caché de sedes termine de cargar.
  const [selectedSedeIds, setSelectedSedeIds] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(report.rep_is_enabled ?? true);

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Sincroniza los campos cuando cambia el reporte seleccionado.
  useEffect(() => {
    setSelectedUser({
      value: report.rep_usuario_id,
      label: report.rep_usuario_nombre,
      email: report.rep_correo ?? "",
    });
    setEmail(report.rep_correo ?? "");
    setModule(report.rep_modulo ?? "checklist");
    setPeriod(report.rep_periodo ?? "dia");
    setHour(report.rep_hora ?? DEFAULT_REPORT_HOUR);
    setWeekDay(report.rep_dia_semana ?? 1);
    setAllSedes(report.rep_todas_sedes ?? true);
    setSelectedSedeIds(report.rep_sedes ?? []);
    setIsEnabled(report.rep_is_enabled ?? true);
  }, [report]); // cierra useEffect

  if (!isOpen) {
    return null;
  } // cierra if (!isOpen)

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  // Al cambiar de módulo el período debe volver al válido para ese módulo.
  const handleModuleChange = (nextModule: AutomaticReportModule) => {
    setModule(nextModule);
    setPeriod(getDefaultPeriod(nextModule));
    setWeekDay(isChecklistModule(nextModule) ? 1 : null);
  }; // cierra const handleModuleChange

  const handleSave = async () => {
    const validationError = validateForm(
      selectedUser,
      email,
      hour,
      allSedes,
      selectedSedeIds.length
    );
    if (validationError) {
      notify(false, validationError);
      return;
    } // cierra if (validationError)
    if (!report.id) return;

    const ok = await updateAutomaticReportById(report.id, {
      rep_usuario_id: selectedUser?.value ?? "",
      rep_usuario_nombre: selectedUser?.label ?? "",
      rep_correo: email.trim(),
      rep_modulo: module,
      rep_periodo: period,
      rep_hora: hour,
      rep_dia_semana: isChecklistModule(module) ? weekDay : null,
      rep_todas_sedes: allSedes,
      rep_sedes: allSedes ? [] : selectedSedeIds,
      rep_is_enabled: isEnabled,
      rep_usuario_update_id: user?.id ?? "",
    });

    notify(ok, ok ? "Reporte actualizado." : "No se pudo actualizar el reporte.");
    if (ok) {
      onSubmit();
    } // cierra if (ok)
  }; // cierra const handleSave

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              {isEdit ? "Editar reporte automático" : "Detalle del reporte automático"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className={labelCls}>Usuario que recibe el correo</label>
              {isEdit ? (
                <UserSearchSelect
                  value={selectedUser}
                  onChange={(option) => {
                    setSelectedUser(option);
                    setEmail(option?.email ?? "");
                  }}
                />
              ) : (
                <div className={readonlyCls}>{report.rep_usuario_nombre || "—"}</div>
              )}
            </div>

            <div>
              <label className={labelCls}>Correo</label>
              {isEdit ? (
                <input
                  className={inputCls}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={250}
                />
              ) : (
                <div className={readonlyCls}>{report.rep_correo || "—"}</div>
              )}
            </div>

            <div>
              <label className={labelCls}>Tipo de reporte</label>
              {isEdit ? (
                <select
                  className={`${inputCls} appearance-none`}
                  value={module}
                  onChange={(e) => handleModuleChange(e.target.value as AutomaticReportModule)}
                >
                  {REPORT_MODULES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={readonlyCls}>{getReportModuleLabel(report.rep_modulo)}</div>
              )}
            </div>

            <div>
              <label className={labelCls}>Programación</label>
              {isEdit ? (
                <ScheduleFields
                  module={module}
                  period={period}
                  onPeriodChange={setPeriod}
                  hour={hour}
                  onHourChange={setHour}
                  weekDay={weekDay}
                  onWeekDayChange={setWeekDay}
                />
              ) : (
                <div className={readonlyCls}>
                  {getPeriodLabel(report.rep_periodo)}
                  {isChecklistModule(report.rep_modulo) &&
                    ` · ${getWeekDayLabel(report.rep_dia_semana)}`}
                  {` · ${report.rep_hora ?? "—"}`}
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Sedes</label>
              {isEdit ? (
                <SedeMultiSelect
                  allSedes={allSedes}
                  onAllSedesChange={setAllSedes}
                  selectedSedes={toOptions(selectedSedeIds)}
                  onSelectedSedesChange={(sedes) =>
                    setSelectedSedeIds(sedes.map((s) => s.value))
                  }
                />
              ) : (
                <SedeSummary
                  allSedes={report.rep_todas_sedes}
                  names={toNames(report.rep_sedes ?? [])}
                />
              )}
            </div>

            <div>
              <label className={labelCls}>Estado</label>
              {isEdit ? (
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary-gold cursor-pointer"
                  />
                  Envío activo
                </label>
              ) : (
                <div className={readonlyCls}>
                  {report.rep_is_enabled ? "Activo" : "Pausado"}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {isEdit && (
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary-dark rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
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
}; // cierra const AutomaticReportModal

interface SedeSummaryProps {
  allSedes: boolean;
  names: string[];
}

const SedeSummary: React.FC<SedeSummaryProps> = ({ allSedes, names }) => {
  if (allSedes) {
    return <div className={readonlyCls}>Todas las sedes</div>;
  } // cierra if (allSedes)

  return (
    <div className={`${readonlyCls} flex flex-wrap gap-1.5`}>
      {names.length === 0 ? (
        "—"
      ) : (
        names.map((name) => (
          <span
            key={name}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
          >
            {name}
          </span>
        ))
      )}
    </div>
  ); // cierra return
}; // cierra const SedeSummary

export default AutomaticReportModal;
