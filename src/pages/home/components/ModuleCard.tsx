import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface ModuleLiveMetric {
  label: string;
  value: string | number;
  tone?: "neutral" | "action" | "danger" | "success";
}

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  disabled?: boolean; // módulo sin ruta/datos todavía
  metrics?: ModuleLiveMetric[];
}

const METRIC_TONE: Record<string, string> = {
  neutral: "text-slate-600",
  action: "text-primary-gold font-bold",
  danger: "text-danger font-bold",
  success: "text-success font-bold",
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  subtitle,
  icon,
  route,
  disabled = false,
  metrics = [],
}) => {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && navigate(route)}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={disabled ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group relative text-left w-full h-full flex flex-col justify-between rounded-[32px] border-0 p-6 transition-all ${
        disabled
          ? "bg-slate-100/70 cursor-not-allowed opacity-75 shadow-none"
          : "bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] cursor-pointer"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-3.5 rounded-full text-xl flex items-center justify-center transition-colors ${
            disabled
              ? "text-slate-400 bg-slate-200/70"
              : "text-primary-gold bg-primary-gold/15 group-hover:bg-primary-gold group-hover:text-white"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-800 truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {metrics.length > 0 && !disabled && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col">
              <span
                className={`text-lg font-black leading-none ${
                  METRIC_TONE[m.tone ?? "neutral"]
                }`}
              >
                {m.value}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        {disabled ? (
          <span className="text-xs font-semibold text-slate-400">
            Próximamente
          </span>
        ) : (
          <span className="text-sm font-bold text-primary-gold flex items-center gap-1">
            Ir al módulo
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default ModuleCard;
