import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SlideBar } from '../route/navbar/SlideBar';
import { RootState } from '../store/store';
import { FiChevronUp } from 'react-icons/fi';

// ── Mapa de rutas → títulos de página ────────────────────────────────────────
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Panel Principal', subtitle: 'Resumen ejecutivo del negocio' },
  '/administration/user-manager': { title: 'Gestión de Usuarios', subtitle: 'Administración de accesos y perfiles' },
  '/administration/permission-manager': { title: 'Roles y Permisos', subtitle: 'Control de accesos por rol' },
  '/administration/users-locations': { title: 'Ubicaciones', subtitle: 'Asignación geográfica de usuarios' },
  '/administration/users-categories': { title: 'Categorías de Usuarios', subtitle: 'Clasificación y permisos de usuarios en listas' },
  '/checkList/users-categories': { title: 'Categorías de Usuarios', subtitle: 'Clasificación y asignación de usuarios en checklists' },
  '/administration/version-manager': { title: 'Versiones', subtitle: 'Control de versiones del sistema' },
  '/technicalManagers/sede-manager': { title: 'Sedes', subtitle: 'Administración de sucursales' },
  '/technicalManagers/sector-manager': { title: 'Sectores', subtitle: 'Gestión de sectores operativos' },
  '/technicalManagers/area-manager': { title: 'Áreas', subtitle: 'Configuración de áreas de trabajo' },
  '/technicalManagers/category-Checklist': { title: 'Categorías de Checklist', subtitle: 'Clasificación de listas de verificación' },
  '/technicalManagers/category-helpdesk': { title: 'Categorías HelpDesk', subtitle: 'Clasificación de solicitudes de soporte' },
  '/technicalManagers/GenerateQR': { title: 'Códigos QR', subtitle: 'Generación de accesos por QR' },
  '/technicalManagers/checklist-config': { title: 'Configuración de QR', subtitle: 'Ajustes del sistema de checklists' },
  '/checkList/Checklist-Manager': { title: 'Gestión de Checklists', subtitle: 'Creación y edición de listas' },
  '/checkList/Register-Review': { title: 'Registro de Revisiones', subtitle: 'Captura de evaluaciones en sitio' },
  '/checkList/Review-And-Results': { title: 'Revisiones y Resultados', subtitle: 'Análisis de evaluaciones realizadas' },
  '/checkList/Reports': { title: 'Reportes', subtitle: 'Informes consolidados de checklists' },
  '/checkList/Priorities-Manager': { title: 'Prioridades HelpDesk', subtitle: 'Administración de niveles de urgencia' },
  '/helpdesk/Reports': { title: 'Reportes de Tickets', subtitle: 'Mesa de Ayuda y SLA' },
};

const getPageInfo = (pathname: string) => {
  return (
    PAGE_TITLES[pathname] ?? { title: 'Panel', subtitle: 'Sistema de gestión empresarial' }
  );
};

// ── Breadcrumb automático ─────────────────────────────────────────────────────
const Breadcrumb: React.FC<{ pathname: string }> = ({ pathname }) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const labels: Record<string, string> = {
    administration: 'Administración',
    technicalManagers: 'Gestión Técnica',
    checkList: 'Checklists',
    'user-manager': 'Usuarios',
    'permission-manager': 'Permisos',
    'users-locations': 'Ubicaciones',
    'users-categories': 'Categorías',
    'version-manager': 'Versiones',
    'sede-manager': 'Sedes',
    'sector-manager': 'Sectores',
    'area-manager': 'Áreas',
    'category-Checklist': 'Categorías',
    'category-helpdesk': 'Cat. HelpDesk',
    GenerateQR: 'Códigos QR',
    'checklist-config': 'Configuración de QR',
    'Checklist-Manager': 'Checklists',
    'Register-Review': 'Registro',
    'Review-And-Results': 'Resultados',
    Reports: 'Reportes',
    'Priorities-Manager': 'Prioridades',
    helpdesk: 'HelpDesk',
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
      <span className="hover:text-orange-500 cursor-pointer transition-colors">Inicio</span>
      {segments.map((seg, i) => (
        <React.Fragment key={seg}>
          <span className="text-gray-300">/</span>
          <span
            className={`${
              i === segments.length - 1
                ? 'text-orange-500 font-medium'
                : 'hover:text-gray-600 cursor-pointer transition-colors'
            }`}
          >
            {labels[seg] ?? seg}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

// ── Indicador de hora ─────────────────────────────────────────────────────────
const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const formatted = time.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <span className="text-xs text-gray-400 font-medium hidden sm:block capitalize">
      {formatted}
    </span>
  );
};

// ── Layout principal ──────────────────────────────────────────────────────────
const ProtectedRouteLayout: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsMinimized(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detectar scroll para mostrar botón "volver arriba"
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  // Ancho del sidebar según estado
  const sidebarW = isMobile ? 0 : isMinimized ? 80 : 256;
  const pageInfo = getPageInfo(location.pathname);

  return (
    <>
      {/* Fuente ejecutiva */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5, h6, .font-gabarito { font-family: 'Inter', sans-serif; }

        .app-header {
          background: #ffffff;
          border-bottom: 1px solid #F1F0EE;
        }

        .content-area {
          background: #F7F6F4;
          min-height: calc(100vh - 64px);
        }

        .page-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
        }

        .scroll-btn {
          background: linear-gradient(135deg, #F97316, #EA580C);
          box-shadow: 0 4px 16px rgba(249,115,22,0.35);
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .scroll-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.45);
        }
        .scroll-btn-enter {
          animation: fadeUp 0.25s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .company-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F97316;
          display: inline-block;
          margin-right: 6px;
          position: relative;
          top: -1px;
        }
      `}</style>

      <div className="flex min-h-screen bg-[#F7F6F4]">
        {/* ── Sidebar ── */}
        <SlideBar
          isMinimized={isMinimized}
          toggleMinimize={() => setIsMinimized((p) => !p)}
          isMobile={isMobile}
        />

        {/* ── Zona derecha ── */}
        <div
          className="flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out"
          style={{ marginLeft: sidebarW }}
        >
          {/* ── Header ── */}
          <header className="app-header sticky top-0 z-30 h-16 flex items-center px-6 gap-4">
            {/* Nombre empresa + separador */}
            <div className="flex items-center gap-3 shrink-0">
              <img src="/img/logo_only.png" alt="Pristine" className="h-6 w-6 object-contain rounded" />
              <span
                className="font-semibold text-sm text-gray-800 tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {process.env.REACT_APP_NAMECOMPANY || 'Pristine'}
              </span>
              <span className="hidden md:block w-px h-4 bg-gray-200" />
            </div>

            {/* Título de página actual */}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                {pageInfo.title}
              </h1>
              <Breadcrumb pathname={location.pathname} />
            </div>

            {/* Elementos del lado derecho */}
            <div className="flex items-center gap-4 shrink-0">
              <LiveClock />

              {/* Separador */}
              <span className="w-px h-5 bg-gray-200 hidden sm:block" />

              {/* Avatar compacto del usuario logueado */}
              {user && (
                <div className="flex items-center gap-2.5">
                  {user.url_photo ? (
                    <img
                      src={user.url_photo}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {user.rol_name ?? 'Gerente'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* ── Contenido de la página ── */}
          <main className="flex-1 content-area">
            {/* Franja de contexto superior */}
            <div className="px-6 pt-6 pb-0">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">
                    {pageInfo.subtitle}
                  </p>
                  <h2
                    className="text-2xl font-semibold text-gray-900 leading-tight"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {pageInfo.title}
                  </h2>
                </div>
                {/* Línea decorativa */}
                <div className="hidden md:block h-px flex-1 mx-8 bg-gradient-to-r from-orange-200 to-transparent" />
              </div>
            </div>

            {/* Contenido de la ruta activa */}
            <div className="px-6 pb-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* ── Botón scroll to top ── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-btn scroll-btn-enter fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white focus:outline-none"
          aria-label="Volver al inicio"
        >
          <FiChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default ProtectedRouteLayout;
