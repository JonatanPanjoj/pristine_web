// src/pages/AutomaticReports/components/ScheduleFields.tsx
import React from "react";
import {
  AutomaticReportModule,
  AutomaticReportPeriod,
} from "../../../models/AutomaticReport";
import {
  getPeriodOptions,
  isChecklistModule,
  WEEK_DAYS,
} from "../constants/reportSchedule";
import { inputCls, labelCls } from "../constants/formStyles";
import { FiClock, FiCalendar } from "react-icons/fi";

interface ScheduleFieldsProps {
  module: AutomaticReportModule;
  period: AutomaticReportPeriod;
  onPeriodChange: (period: AutomaticReportPeriod) => void;
  hour: string;
  onHourChange: (hour: string) => void;
  weekDay: number | null;
  onWeekDayChange: (weekDay: number | null) => void;
}

// Checklist consolida rangos largos y necesita día + período; el resto de
// módulos sólo elige la hora a la que recibe el reporte del día.
const ScheduleFields: React.FC<ScheduleFieldsProps> = ({
  module,
  period,
  onPeriodChange,
  hour,
  onHourChange,
  weekDay,
  onWeekDayChange,
}) => {
  const isChecklist = isChecklistModule(module);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {isChecklist && (
        <div className="sm:col-span-2">
          <label className={labelCls}>
            <FiCalendar className="inline w-3 h-3 mr-1 -mt-0.5" />
            Período que cubre el reporte
          </label>
          <select
            className={`${inputCls} appearance-none`}
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as AutomaticReportPeriod)}
          >
            {getPeriodOptions(module).map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isChecklist && (
        <div>
          <label className={labelCls}>Día de envío</label>
          <select
            className={`${inputCls} appearance-none`}
            value={weekDay ?? 1}
            onChange={(e) => onWeekDayChange(Number(e.target.value))}
          >
            {WEEK_DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={isChecklist ? "" : "sm:col-span-2"}>
        <label className={labelCls}>
          <FiClock className="inline w-3 h-3 mr-1 -mt-0.5" />
          {isChecklist ? "Hora de envío" : "Horario para recibir el reporte del día"}
        </label>
        <input
          type="time"
          className={inputCls}
          value={hour}
          onChange={(e) => onHourChange(e.target.value)}
        />
      </div>
    </div>
  ); // cierra return
}; // cierra const ScheduleFields

export default ScheduleFields;
