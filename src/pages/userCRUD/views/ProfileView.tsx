// views/ProfileView.tsx
// Perfil — shell premium: cabecera flotante + framer-motion + grid de tarjetas.

import React from "react";
import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";
import ProfileCard from "../components/ProfileCard";
import ProfilePreferences from "../components/ProfilePreferences";
import PersonalInfoForm from "../components/PersonalInfoForm";
import AccountInfoForm from "../components/AccountInfoForm";

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ProfileView: React.FC = () => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col p-6 md:p-8">
      {/* Cabecera flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <FiUser className="w-6 h-6 mr-3 text-primary-gold" />
          Perfil
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configuración de tu cuenta y datos personales.</p>
      </motion.div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={cardVariants}><ProfileCard /></motion.div>
          <motion.div variants={cardVariants}><ProfilePreferences /></motion.div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={cardVariants}><PersonalInfoForm /></motion.div>
          <motion.div variants={cardVariants}><AccountInfoForm /></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileView;
