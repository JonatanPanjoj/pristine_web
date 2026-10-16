import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlineHome,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineCheckCircle,
  HiOutlineClock
} from "react-icons/hi";
import { Sparkles, ArrowRight, Layers, MapPin } from "lucide-react";
import { RootState } from "../../../store/store";
import useRoles from "../../../rolKeys/getRolKeys";
import useMenuLinks from "../../../route/routerLink/useMenuLinks";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

const Home: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { getRoleKeyByName } = useRoles();
  const { getLinkByName } = useMenuLinks();

  const hasPermission = (name: string) => {
    const key = getRoleKeyByName(name);
    return key ? user?.permissions?.includes(key) ?? false : false;
  };

  const modules = [
    {
      title: "Administración",
      description: "Gestión centralizada de usuarios, asignación de permisos de seguridad, roles y versiones del sistema.",
      icon: HiOutlineUserGroup,
      path: getLinkByName("userManager") || "/userManager",
      badge: "Seguridad & Usuarios",
      color: "from-sky-500 to-sky-700",
      accentBg: "bg-sky-50",
      accentText: "text-sky-700",
      links: [
        { label: "Gestor de Usuarios", path: getLinkByName("userManager") },
        { label: "Roles y Permisos", path: getLinkByName("permissionManager") },
        { label: "Ubicaciones de Usuarios", path: getLinkByName("usersLocations") },
      ],
      visible: hasPermission("userManager") || hasPermission("permissionManager") || true,
    },
    {
      title: "Gestor de Técnicos",
      description: "Catálogos base de sedes, sectores, áreas técnicas, generación de códigos QR y reglas de anticipación.",
      icon: HiOutlineHome,
      path: getLinkByName("sedesManager") || "/sedesManager",
      badge: "Infraestructura & Sedes",
      color: "from-blue-500 to-indigo-600",
      accentBg: "bg-blue-50",
      accentText: "text-blue-700",
      links: [
        { label: "Catálogo de Sedes", path: getLinkByName("sedesManager") },
        { label: "Sectores y Áreas", path: getLinkByName("sectorManager") },
        { label: "Generador de QR", path: getLinkByName("GenerateQR") },
      ],
      visible: hasPermission("sedesManager") || hasPermission("sectorManager") || true,
    },
    {
      title: "Módulo de Checklist",
      description: "Ejecución, auditoría y análisis de listas de verificación técnica, control de frecuencias y reportes de cumplimiento.",
      icon: HiOutlineClipboardList,
      path: getLinkByName("ChecklistView") || "/checklistDashboard",
      badge: "Auditoría & Operaciones",
      color: "from-cyan-500 to-teal-600",
      accentBg: "bg-cyan-50",
      accentText: "text-cyan-800",
      links: [
        { label: "Dashboard Checklist", path: getLinkByName("ChecklistView") },
        { label: "Gestor de Programaciones", path: getLinkByName("checkListManager") },
        { label: "Revisiones y Resultados", path: getLinkByName("review&results") },
      ],
      visible: hasPermission("checkListManager") || hasPermission("review&results") || true,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Banner de Bienvenida Pristine */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>PRISTINE MANAGEMENT PLATFORM</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] tracking-tight">
            Bienvenido, {user?.name || "Administrador"}
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Plataforma operativa para la administración de personal técnico, infraestructura de sedes y control de calidad mediante auditorías de Checklist.
          </p>
        </div>

        {/* Acceso Rápido Badge */}
        <div className="z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            to={getLinkByName("ChecklistView") || "/checklistDashboard"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#389CD6] to-[#2575A5] text-white rounded-full font-bold text-sm shadow-[0_4px_16px_rgba(56,156,214,0.3)] hover:opacity-95 transition-all active:scale-95"
          >
            <HiOutlineChartBar className="w-5 h-5" />
            <span>Ver Dashboard</span>
          </Link>
          <Link
            to={getLinkByName("checkListManager") || "/checkListManager"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-sm transition-all active:scale-95"
          >
            <HiOutlineClock className="w-5 h-5" />
            <span>Programaciones</span>
          </Link>
        </div>

        {/* Esfera decorativa de fondo Baby Blue */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Tarjetas Principales de los 3 Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((m, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col justify-between transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${m.accentBg} ${m.accentText} flex items-center justify-center shadow-sm`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${m.accentBg} ${m.accentText}`}>
                  {m.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1E3A5F]">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Sub-enlaces */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                {m.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to={link.path || "#"}
                    className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-[#389CD6] py-1 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4">
              <Link
                to={m.path}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#1E3A5F] hover:bg-[#132640] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <span>Acceder al Módulo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Indicadores de Entorno y Conexión */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Estado del Sistema:</span>
          <span>Conectado a MongoDB API (Pristine Engine)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Versión: 1.0.0</span>
          <span>•</span>
          <span>Arquitectura: React + Node.js + MongoDB</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
