// src/pages/AutomaticReports/components/AutomaticReportForm.tsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import useCreateAutomaticReport from "../hooks/useCreateAutomaticReport";
import UserSearchSelect, { UserOption } from "./UserSearchSelect";
import SedeMultiSelect, { SedeOption } from "./SedeMultiSelect";
import ScheduleFields from "./ScheduleFields";
import { ExitoCard } from "../../../components/ExitoCard";
import {
  AutomaticReport,
  AutomaticReportModule,
  AutomaticReportPeriod,
} from "../../../models/AutomaticReport";
import { REPORT_MODULES } from "../constants/reportModules";
import {
  DEFAULT_REPORT_HOUR,
  getDefaultPeriod,
  isChecklistModule,
} from "../constants/reportSchedule";
import { inputCls, labelCls } from "../constants/formStyles";
import { FiSave, FiMail, FiGrid, FiMapPin, FiUser } from "react-icons/fi";

interface AutomaticReportFormProps {
  onSuccess?: () => void;
}

const AutomaticReportForm: React.FC<AutomaticReportFormProps> = ({ onSuccess }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { handleCreateAutomaticReport, loading } = useCreateAutomaticReport();

  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [email, setEmail] = useState("");
  const [module, setModule] = useState<AutomaticReportModule>("checklist");
  const [period, setPeriod] = useState<AutomaticReportPeriod>(getDefaultPeriod("checklist"));
  const [hour, setHour] = useState(DEFAULT_REPORT_HOUR);
  const [weekDay, setWeekDay] = useState<number | null>(1);
  const [allSedes, setAllSedes] = useState(true);
  const [selectedSedes, setSelectedSedes] = useState<SedeOption[]>([]);

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
    setSelectedUser(null);
    setEmail("");
    handleModuleChange("checklist");
    setHour(DEFAULT_REPORT_HOUR);
    setAllSedes(true);
    setSelectedSedes([]);
  }; // cierra const resetForm

  // Al cambiar de módulo el período debe volver al válido para ese módulo.
  const handleModuleChange = (nextModule: AutomaticReportModule) => {
    setModule(nextModule);
    setPeriod(getDefaultPeriod(nextModule));
    setWeekDay(isChecklistModule(nextModule) ? 1 : null);
  }; // cierra const handleModuleChange

  // Al elegir usuario se precarga su correo, pero queda editable.
  const handleUserChange = (option: UserOption | null) => {
    setSelectedUser(option);
    setEmail(option?.email ?? "");
  }; // cierra const handleUserChange

  const handleSubmit = async () => {
    const validationError = validateForm(
      selectedUser,
      email,
      hour,
      allSedes,
      selectedSedes.length
    );
    if (validationError) {
      notify(false, validationError);
      return;
    } // cierra if (validationError)

    const newReport: AutomaticReport = {
      rep_usuario_id: selectedUser?.value ?? "",
      rep_usuario_nombre: selectedUser?.label ?? "",
      rep_correo: email.trim(),
      rep_modulo: module,
      rep_periodo: period,
      rep_hora: hour,
      rep_dia_semana: isChecklistModule(module) ? weekDay : null,
      rep_todas_sedes: allSedes,
      rep_sedes: allSedes ? [] : selectedSedes.map((s) => s.value),
      rep_is_enabled: true,
      rep_usuario_update_id: user?.id ?? "",
    };

    const { success: ok, message: msg } = await handleCreateAutomaticReport(newReport);
    notify(ok, msg);
    if (ok) {
      resetForm();
      // onSuccess se dispara al cerrar la ExitoCard, para que el toast alcance a
      // verse antes de que se cierre el modal.
    } // cierra if (ok)
  }; // cierra const handleSubmit

  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary-gold/15 text-primary-gold flex items-center justify-center">
          <FiMail className="w-4 h-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold text-primary-gold uppercase tracking-widest">
            Nuevo envío
          </p>
          <h2 className="text-[15px] font-semibold text-slate-800">
            Registrar reporte automático
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>
            <FiUser className="inline w-3 h-3 mr-1 -mt-0.5" />
            Usuario que recibirá el correo
          </label>
          <UserSearchSelect value={selectedUser} onChange={handleUserChange} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Correo</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
            <input
              className={`${inputCls} pl-10`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={250}
              placeholder="correo@empresa.com"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>
            <FiGrid className="inline w-3 h-3 mr-1 -mt-0.5" />
            Tipo de reporte
          </label>
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
        </div>

        <div className="sm:col-span-2">
          <ScheduleFields
            module={module}
            period={period}
            onPeriodChange={setPeriod}
            hour={hour}
            onHourChange={setHour}
            weekDay={weekDay}
            onWeekDayChange={setWeekDay}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>
            <FiMapPin className="inline w-3 h-3 mr-1 -mt-0.5" />
            Sedes
          </label>
          <SedeMultiSelect
            allSedes={allSedes}
            onAllSedesChange={setAllSedes}
            selectedSedes={selectedSedes}
            onSelectedSedesChange={setSelectedSedes}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-dark rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
        >
          <FiSave className="w-4 h-4" />
          {loading ? "Guardando…" : "Guardar reporte"}
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
}; // cierra const AutomaticReportForm

// Devuelve el primer mensaje de error encontrado, o null si el formulario es válido.
export const validateForm = (
  selectedUser: UserOption | null,
  email: string,
  hour: string,
  allSedes: boolean,
  selectedSedesCount: number
): string | null => {
  if (!selectedUser) return "Selecciona el usuario que recibirá el correo.";
  if (!email.trim()) return "Ingresa el correo de destino.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "El correo no tiene un formato válido.";
  if (!/^\d{2}:\d{2}$/.test(hour)) return "Indica la hora de envío del reporte.";
  if (!allSedes && selectedSedesCount === 0) return "Selecciona al menos una sede.";
  return null;
}; // cierra export const validateForm

export default AutomaticReportForm;
