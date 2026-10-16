// components/ChecklistTrendChart.tsx
// Tendencia diaria de cumplimiento del periodo. Es la única gráfica que aporta
// una dimensión que los tableros no muestran (la evolución en el tiempo), por eso
// va a ancho completo y solo aparece en semana o mes.

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ScheduleOccurrence } from '../adapters/getSchedulesByRangeAdapter';

const GOLD = '#FCB521';
const AXIS = '#64748B';
const GRID = '#E2E8F0';
const OBJETIVO = 70;

const TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  fontSize: '12px',
};

const formatCompliance = (value: unknown): [string, string] => [`${value ?? 0}%`, 'Cumplimiento'];

interface ChecklistTrendChartProps {
  occurrences: ScheduleOccurrence[];
}

export const ChecklistTrendChart: React.FC<ChecklistTrendChartProps> = ({ occurrences }) => {
  const trend = useMemo(() => {
    const days: Record<string, { done: number; total: number }> = {};

    occurrences.forEach((occurrence) => {
      if (!days[occurrence.date]) days[occurrence.date] = { done: 0, total: 0 };
      days[occurrence.date].total++;
      if (occurrence.status === 'completed') days[occurrence.date].done++;
    });

    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, group]) => ({
        name: date.slice(5), // MM-DD
        value: Math.round((group.done / group.total) * 100),
      }));
  }, [occurrences]);

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Tendencia diaria de cumplimiento</h3>
        <p className="text-xs text-slate-500 mt-0.5">Evolución día a día dentro del periodo seleccionado</p>
      </div>

      <div className="p-6 h-[260px] w-full">
        {trend.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[13px] text-slate-400">
            Sin datos en este periodo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 20, left: -12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} domain={[0, 100]} unit="%" />
              <ReferenceLine y={OBJETIVO} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'Meta', position: 'right', fill: AXIS, fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatCompliance} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={GOLD}
                strokeWidth={3}
                dot={{ r: 3, fill: GOLD, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChecklistTrendChart;
