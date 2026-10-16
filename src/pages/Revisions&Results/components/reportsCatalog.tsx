// reportsCatalog.tsx
// Fuente única de los reportes de checklist: mapea cada key con su etiqueta y su
// componente. Lo consume ChecklistReportsView (tabs + render inline), evitando
// duplicar la lista de reportes en varios lugares.

import React from 'react';
import RevisionsReport from './RevisionsReport';
import ResultsReport from './ResultsReport';
import CheckReport from './CheckReport';
import ListReport from './ListReport';

export type ReportKey = 'revisions' | 'results' | 'compliance' | 'checklists';

export interface ReportDef {
  key: ReportKey;
  label: string;
  Component: React.FC;
  // El reporte trae su propio layout de tarjetas (no debe envolverse en una card)
  standalone?: boolean;
}

export const REPORTS: ReportDef[] = [
  { key: 'revisions',  label: 'Reportes de revisiones',           Component: RevisionsReport, standalone: true },
  { key: 'results',    label: 'Reportes periódico de resultados', Component: ResultsReport,   standalone: true },
  { key: 'compliance', label: 'Reportes cumplimiento de escaneo', Component: CheckReport,     standalone: true },
  { key: 'checklists', label: 'Reportes de listas de chequeo',    Component: ListReport,      standalone: true },
];

export const getReport = (key: string): ReportDef | undefined =>
  REPORTS.find((r) => r.key === key);
