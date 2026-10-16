// components/ReportCard.tsx
// Tarjeta de reporte con cabecera dorada (banda) y cuerpo blanco. Base visual
// compartida por las tarjetas de filtros de los reportes.

import React from "react";

interface ReportCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, children, className = "", bodyClassName = "" }) => (
  <div
    className={`bg-white border border-neutral-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col overflow-hidden ${className}`}
  >
    <div className="bg-primary-gold px-6 py-5 font-bold text-white text-[15px] flex-shrink-0">{title}</div>
    <div className={`p-5 flex-1 ${bodyClassName}`}>{children}</div>
  </div>
);

export default ReportCard;
