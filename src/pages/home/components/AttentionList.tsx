import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";

export interface AttentionItem {
  id: string;
  title: string; // ej. TICK-123 · Área
  meta: string; // ej. "Abierto 3d · Juan Pérez"
  tag: string; // prioridad / etiqueta
  tone: "danger" | "attention";
  route: string;
}

interface AttentionListProps {
  items: AttentionItem[];
  title?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

const DEFAULT_TITLE = "Requiere tu atención";
const DEFAULT_EMPTY_TITLE = "Todo bajo control";
const DEFAULT_EMPTY_MESSAGE = "No hay tickets urgentes ni pendientes críticos.";

const TONE_CHIP: Record<string, string> = {
  danger: "bg-danger/10 text-danger border border-danger/25",
  attention: "bg-attention/10 text-attention border border-attention/25",
};

export const AttentionList: React.FC<AttentionListProps> = ({
  items,
  title = DEFAULT_TITLE,
  emptyTitle = DEFAULT_EMPTY_TITLE,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[32px] border-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-danger" />
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <ShieldCheck className="w-10 h-10 text-success mb-2" />
          <p className="text-sm font-bold text-slate-800">{emptyTitle}</p>
          <p className="text-xs text-slate-500 mt-1">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                type="button"
                onClick={() => navigate(item.route)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] hover:bg-slate-100/80 transition-all text-left group border-0 shadow-none hover:shadow-sm"
              >
                <span
                  className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    TONE_CHIP[item.tone]
                  }`}
                >
                  {item.tag}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                    {item.meta}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttentionList;
