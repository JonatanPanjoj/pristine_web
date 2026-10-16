import React from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

export type StatTone = "action" | "danger" | "success" | "attention" | "accent";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  tone?: StatTone;
  footnote?: string;
  progress?: number; // 0-100 opcional
}

// Mapa de tonos → clases del design system (sin bordes)
const TONES: Record<
  StatTone,
  { icon: string; value: string; bar: string }
> = {
  action: {
    icon: "text-primary-gold bg-primary-gold/15",
    value: "text-slate-800",
    bar: "bg-primary-gold",
  },
  danger: {
    icon: "text-danger bg-danger/10",
    value: "text-slate-800",
    bar: "bg-danger",
  },
  success: {
    icon: "text-success bg-success/10",
    value: "text-slate-800",
    bar: "bg-success",
  },
  attention: {
    icon: "text-attention bg-attention/10",
    value: "text-slate-800",
    bar: "bg-attention",
  },
  accent: {
    icon: "text-amber-600 bg-amber-500/15",
    value: "text-slate-800",
    bar: "bg-amber-500",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix,
  decimals = 0,
  icon,
  tone = "action",
  footnote,
  progress,
}) => {
  const t = TONES[tone];
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="bg-white rounded-[32px] border-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 flex flex-col justify-between transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <div className={`p-3.5 rounded-full flex items-center justify-center ${t.icon}`}>{icon}</div>
      </div>

      <div className={`text-3xl font-bold tracking-tight ${t.value}`}>
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
      </div>

      {progress !== undefined && (
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className={`h-1.5 rounded-full ${t.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      )}

      {footnote && (
        <p className="mt-3 text-xs text-slate-500 font-medium">{footnote}</p>
      )}
    </motion.div>
  );
};

export default StatCard;
