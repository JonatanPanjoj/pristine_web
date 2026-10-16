import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[32px]">
          {title && <h3 className="font-bold text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

export default Card;
