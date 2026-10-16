// src/pages/AutomaticReports/constants/reportModules.ts
import { AutomaticReportModule } from "../../../models/AutomaticReport";

interface ReportModuleOption {
  value: AutomaticReportModule;
  label: string;
}

export const REPORT_MODULES: ReportModuleOption[] = [
  { value: "checklist", label: "Checklist" },
  { value: "helpdesk", label: "HelpDesk" },
  { value: "ppm", label: "PPM" },
  { value: "auditoria", label: "Auditoría" },
];

export const getReportModuleLabel = (value: AutomaticReportModule): string => {
  const option = REPORT_MODULES.find((m) => m.value === value);
  return option ? option.label : "—";
}; // cierra export const getReportModuleLabel
