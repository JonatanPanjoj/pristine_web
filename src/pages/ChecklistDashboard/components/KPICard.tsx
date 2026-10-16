import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

export type KPIStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  status?: KPIStatus;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  progress?: number;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  status = 'neutral',
  trend,
  progress
}: KPICardProps) {
  const statusColors = {
    success: 'text-success bg-success/10',
    warning: 'text-attention bg-attention/10',
    danger: 'text-danger bg-danger/10',
    primary: 'text-primary bg-primary/10',
    neutral: 'text-slate-600 bg-slate-100'
  };

  const progressColors = {
    success: 'bg-success',
    warning: 'bg-attention',
    danger: 'bg-danger',
    primary: 'bg-primary',
    neutral: 'bg-slate-400'
  };

  const iconBgClass = statusColors[status] || 'text-slate-600 bg-slate-100';
  const textColorClass = statusColors[status].split(' ')[0] || 'text-slate-800';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${textColorClass}`}>{value}</span>
            {subtitle && (
              <span className="text-sm text-slate-500 font-medium">{subtitle}</span>
            )}
          </div>
        </div>
        <div className={`p-3.5 rounded-full ${iconBgClass}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-auto flex items-center gap-2 text-sm">
          <span
            className={`flex items-center font-medium ${
              trend.isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend.value}%
          </span>
          <span className="text-slate-500">
            {trend.label || 'vs período anterior'}
          </span>
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 font-medium">Cumplimiento</span>
            <span className={`font-bold ${textColorClass}`}>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${progressColors[status]}`}
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default KPICard;
