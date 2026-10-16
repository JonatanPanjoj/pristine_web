import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KPICard } from '../components/KPICard';
import { Card } from '../components/Card';
import { DashboardFilters } from '../components/DashboardFilters';
import { useFetchChecklistDashboardStats } from '../hooks/useFetchChecklistDashboardStats';
import { FiActivity } from 'react-icons/fi';
import {
  CheckCircle,
  Clock,
  PlayCircle,
  Calendar,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const getHeatmapColor = (val: number) => {
  if (val >= 90) return 'bg-emerald-500/90 text-white font-semibold';
  if (val >= 70) return 'bg-amber-400/90 text-slate-900 font-semibold';
  return 'bg-rose-500/90 text-white font-semibold';
};

export function ChecklistDashboardView() {
  const [filters, setFilters] = useState<any>(null);
  const { stats, loading, error } = useFetchChecklistDashboardStats(filters);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-gold/20 border-t-primary-gold rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Cargando estadísticas de Checklist...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-150 rounded-xl text-center text-red-600 max-w-xl mx-auto my-12">
        <AlertOctagon className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h3 className="font-semibold text-base mb-1">Error al cargar estadísticas</h3>
        <p className="text-xs text-red-500">{error || 'No se pudieron recuperar los datos de Firestore.'}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
    >
      {/* Cabecera superior flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <FiActivity className="w-6 h-6 mr-3 text-primary-gold" />
              Cumplimiento de Checklist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Seguimiento de rutinas operativas, ejecuciones y cumplimiento por sede en tiempo real
            </p>
          </div>
          <div className="text-xs text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 select-none self-start sm:self-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Actualizado: {new Date(stats.lastUpdatedAt).toLocaleTimeString()}
          </div>
        </div>
      </motion.div>

      {/* Barra de Filtros Colapsable */}
      <motion.div variants={cardVariants}>
        <DashboardFilters onSearch={setFilters} onReset={() => setFilters(null)} />
      </motion.div>

      {/* Tarjetas KPI */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Cumplimiento"
          value={`${stats.compliancePct}%`}
          subtitle={
            stats.coveragePct === null
              ? `${stats.executedToday} revisiones`
              : `${stats.executedToday} de ${stats.scheduledToday} programadas · ${stats.coveragePct}% de cobertura`
          }
          icon={<CheckCircle className="w-6 h-6" />}
          status="success"
          progress={stats.compliancePct}
        />

        <KPICard
          title="Revisiones Vencidas"
          value={stats.overdueCount}
          icon={<Clock className="w-6 h-6" />}
          status="danger"
        />

        <KPICard
          title="En Proceso"
          value={stats.inProgressCount}
          icon={<PlayCircle className="w-6 h-6" />}
          status="warning"
        />

        <KPICard
          title="Programadas"
          value={stats.scheduledToday}
          subtitle={stats.periodLabel}
          icon={<Calendar className="w-6 h-6" />}
          status="primary"
        />

        <KPICard
          title="Área Crítica"
          value={stats.worstAreaName}
          subtitle={`${stats.worstAreaPct}%`}
          icon={<AlertTriangle className="w-6 h-6" />}
          status="danger"
        />
      </motion.div>

      {/* Fila 1 de Gráficas: Cumplimiento por Sede + Donut de Estado */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumplimiento por Sede (BarChart) */}
        <Card title="Cumplimiento por Sede" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.locationCompliance}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.locationCompliance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value >= 90
                          ? '#10B981'
                          : entry.value >= 75
                          ? '#FCB426'
                          : '#EF4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Estado de Revisiones (Pie Donut) */}
        <Card title="Estado de Revisiones">
          <div className="h-[230px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {stats.statusData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Fila 2 de Gráficas: Tendencia + Heatmap + Ranking Peores Áreas */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendencia de Cumplimiento */}
        <Card title="Tendencia de Cumplimiento (30 días)" className="lg:col-span-1">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.trendData}
                margin={{
                  top: 5,
                  right: 10,
                  bottom: 5,
                  left: -20
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#FCB426"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#FCB426',
                    strokeWidth: 2,
                    stroke: '#fff'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mapa de Calor (Área vs Hora) */}
        <Card title="Mapa de Calor (Área vs Hora)" className="lg:col-span-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="pb-3 font-medium text-slate-500">Área</th>
                  <th className="pb-3 font-medium text-slate-500 text-center">06:00</th>
                  <th className="pb-3 font-medium text-slate-500 text-center">12:00</th>
                  <th className="pb-3 font-medium text-slate-500 text-center">18:00</th>
                  <th className="pb-3 font-medium text-slate-500 text-center">22:00</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {stats.heatmapData.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-slate-700 truncate max-w-[100px]">
                      {row.area}
                    </td>
                    <td className="p-1">
                      <div className={`w-full h-8 rounded-lg flex items-center justify-center text-xs ${getHeatmapColor(row['06:00'])}`}>
                        {row['06:00']}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className={`w-full h-8 rounded-lg flex items-center justify-center text-xs ${getHeatmapColor(row['12:00'])}`}>
                        {row['12:00']}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className={`w-full h-8 rounded-lg flex items-center justify-center text-xs ${getHeatmapColor(row['18:00'])}`}>
                        {row['18:00']}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className={`w-full h-8 rounded-lg flex items-center justify-center text-xs ${getHeatmapColor(row['22:00'])}`}>
                        {row['22:00']}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Áreas con Mayor Incumplimiento (Ranking) */}
        <Card title="Áreas con Mayor Incumplimiento" className="lg:col-span-1">
          <div className="space-y-4 mt-2">
            {stats.worstAreas.map((area, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 truncate max-w-[130px]">
                      {area.name}
                    </span>
                    <span className="text-danger font-bold">
                      {area.value}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-danger transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, area.value))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default ChecklistDashboardView;
