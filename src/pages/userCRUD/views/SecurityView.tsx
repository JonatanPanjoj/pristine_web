// views/SecurityView.tsx
// Seguridad — shell premium: cabecera flotante + framer-motion + grid de tarjetas.

import React from "react";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import ChangePasswordForm from "../components/ChangePasswordForm";
import SecurityQuestionForm from "../components/SecurityQuestionForm";
import DeactivateAccountCard from "../components/DeactivateAccountCard";

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const SecurityView: React.FC = () => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col p-6 md:p-8">
      {/* Cabecera flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <FiShield className="w-6 h-6 mr-3 text-primary-gold" />
          Seguridad
        </h1>
        <p className="text-sm text-gray-500 mt-1">Protege el acceso a tu cuenta y gestiona su estado.</p>
      </motion.div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <ChangePasswordForm />
        </motion.div>
        <motion.div variants={cardVariants} className="lg:col-span-1">
          <DeactivateAccountCard />
        </motion.div>
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <SecurityQuestionForm />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SecurityView;
