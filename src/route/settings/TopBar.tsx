import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice';
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiSettings,
  FiChevronRight,
  FiMenu,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { HiOutlineClipboardList, HiOutlineSupport } from 'react-icons/hi';
import useNotifications from '../../hooks/useNotifications';

// ── Anchos del sidebar — deben coincidir exactamente con SlideBar ─────────────
const SIDEBAR_EXPANDED  = 256; // px (w-64)
const SIDEBAR_COLLAPSED = 80;  // px (w-20)

// ── Rutas → títulos ───────────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/administration/user-manager': 'Gestor de Usuarios',
  '/administration/permission-manager': 'Gestor de Permisos',
  '/administration/permission-manager/Add-Rol': 'Crear Rol',
  '/administration/permission-manager/permisions': 'Asignar Permisos',
  '/administration/users-locations': 'Usuarios / Sedes',
  '/administration/users-categories': 'Usuarios / Categorías',
  '/checkList/users-categories': 'Usuarios / Categorías',
  '/administration/version-manager': 'Gestor de Versiones',
  '/technicalManagers/sede-manager': 'Gestor de Sedes',
  '/technicalManagers/sector-manager': 'Gestor de Sectores',
  '/technicalManagers/area-manager': 'Gestor de Áreas',
  '/technicalManagers/category-Checklist': 'Categorías de Checklist',
  '/technicalManagers/category-helpdesk': 'Categorías HelpDesk',
  '/technicalManagers/GenerateQR': 'Generador de QR',
  '/technicalManagers/checklist-config': 'Configuración de QR',
  '/technicalManagers/automatic-reports': 'Reportes Automáticos',
  '/checkList/Checklist-Manager': 'Gestor de Checklists',
  '/checkList/Register-Review': 'Registro de Revisión',
  '/checkList/Review-And-Results': 'Revisiones y Resultados',
  '/checkList/Reports': 'Reportes',
  '/checkList/Priorities-Manager': 'Prioridades HelpDesk',
  '/helpdesk/dashboard': 'Dashboard (Helpdesk)',
  '/tickets': 'Bandeja de Tickets',
  '/administration/incidents': 'Gestor de Incidentes',
  '/administration/statuses': 'Gestor de Estados',
  '/helpdesk/Reports': 'Reportes HelpDesk',
  '/profile': 'Mi Perfil',
  '/security': 'Seguridad',
};

const SECTION_LABELS: Record<string, string> = {
  administration: 'Administración',
  technicalManagers: 'Gestor de Técnicos',
  checkList: 'Checklist',
  helpdesk: 'HelpDesk',
  tickets: 'HelpDesk',
};

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/tickets/')) return 'Detalle de Ticket';
  if (pathname.startsWith('/checkList/revisions/')) return 'Detalle de Revisión';
  return ROUTE_LABELS[pathname] ?? 'Panel';
};

const getBreadcrumb = (pathname: string): string[] => {
  if (pathname === '/') return ['Inicio'];
  const segments = pathname.split('/').filter(Boolean);
  const parts: string[] = [];
  
  if (segments[0]) {
    parts.push(SECTION_LABELS[segments[0]] ?? segments[0]);
  }
  
  let pageLabel = ROUTE_LABELS[pathname];
  if (!pageLabel) {
    if (pathname.startsWith('/tickets/')) {
      pageLabel = 'Detalle de Ticket';
    } else if (pathname.startsWith('/checkList/revisions/')) {
      pageLabel = 'Detalle de Revisión';
    } else {
      pageLabel = segments[segments.length - 1];
    }
  }

  if (parts.length === 0 || parts[parts.length - 1].toLowerCase() !== pageLabel.toLowerCase()) {
    parts.push(pageLabel);
  }

  return parts;
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface TopBarProps {
  user: any;
  isMinimized: boolean;
  isMobile: boolean;
  // El TopBar ahora es dueño del toggle — recibe la función para manejarlo
  onToggleSidebar: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
const TopBar: React.FC<TopBarProps> = ({ user, isMinimized, isMobile, onToggleSidebar }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { notifications, loading, hasMore, hasUnseen, loadMore, markAllAsSeen, markAsRead } = useNotifications();

  const pageTitle  = getPageTitle(location.pathname);
  const breadcrumb = getBreadcrumb(location.pathname);

  // left en píxeles — los fixed no responden a margin-left de Tailwind
  const leftPx = isMobile ? 0 : isMinimized ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleNotifClick = () => {
    setIsNotifOpen((prev) => {
      const next = !prev;
      if (next) {
        markAllAsSeen();
      }
      return next;
    });
  };

  const handleNotificationClick = async (notif: any) => {
    await markAsRead(notif.id);
    setIsNotifOpen(false);
    
    if (notif.module === "helpdesk") {
      if (notif.ticket?.id) {
        navigate(`/tickets/${notif.ticket.id}`);
      }
    } else if (notif.module === "checklist") {
      if (notif.revision?.id) {
        navigate(`/checkList/revisions/${notif.revision.id}`);
      } else {
        console.log("Notificación de checklist sin ID de revisión. Marcada como leída.");
      }
    }
  };

  const formatRelativeTime = (dateVal: any): string => {
    if (!dateVal) return "";
    let date: Date;
    if (dateVal.toDate) {
      date = dateVal.toDate();
    } else if (dateVal.seconds) {
      date = new Date(dateVal.seconds * 1000);
    } else {
      date = new Date(dateVal);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hr${diffHours > 1 ? "s" : ""}`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  // Ícono del toggle según contexto
  const ToggleIcon = isMobile
    ? FiMenu                                         // hamburger en móvil
    : isMinimized ? FiChevronsRight : FiChevronsLeft; // colapsar/expandir en desktop

  return (
    <header
      className="fixed top-0 right-0 z-30 h-[60px] bg-white border-b border-gray-100
                 flex items-center justify-between px-4 gap-3"
      style={{
        left: leftPx,
        transition: 'left 0.3s ease-in-out',
      }}
    >

      {/* ── Botón toggle sidebar — integrado en el TopBar ── */}
      <button
        onClick={onToggleSidebar}
        title={isMinimized ? 'Expandir menú' : 'Colapsar menú'}
        className="w-9 h-9 rounded-xl flex items-center justify-center
                   text-gray-500 hover:bg-orange-50 hover:text-orange-500
                   transition-colors shrink-0 focus:outline-none
                   focus:ring-2 focus:ring-orange-200"
      >
        <ToggleIcon className="w-5 h-5" />
      </button>

      {/* Divisor */}
      <span className="w-px h-5 bg-gray-200 shrink-0" />

      {/* ── Breadcrumb — sin h1 duplicado; el título ya lo muestra la card de la vista ── */}
      <div className="flex items-center flex-1 min-w-0">
        <nav className="flex items-center gap-1">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={`${crumb}-${i}`}>
              {i > 0 && <FiChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
              <span
                className={`text-[13px] font-medium truncate ${
                  i === breadcrumb.length - 1
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* ── Derecha ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Nombre empresa */}
        <span className="hidden md:block text-xs font-medium text-gray-400 truncate max-w-[130px]">
          {process.env.REACT_APP_NAMECOMPANY || 'Company Name'}
        </span>
        <span className="hidden md:block w-px h-5 bg-gray-200" />

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className="relative w-8 h-8 rounded-full flex items-center justify-center
                       text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <FiBell className="w-4 h-4" />
            {hasUnseen && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
            )}
          </button>

          {/* Facebook-like Dropdown */}
          {isNotifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl
                         shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[450px]"
              style={{ animation: 'dropIn 0.15s ease forwards' }}
            >
              <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Notificaciones</span>
              </div>
              <div className="flex-1 overflow-y-auto py-1 scrollbar-custom max-h-[350px]">
                {loading && notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
                    Cargando notificaciones...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No tienes notificaciones
                  </div>
                ) : (
                  <>
                    {notifications.map((notif) => {
                      const isChecklist = notif.module === "checklist";
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-gray-50 flex gap-3 items-start transition-colors relative"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isChecklist ? "bg-blue-50 text-blue-500" : "bg-orange-50 text-[#FFA700]"
                          }`}>
                            {isChecklist ? (
                              <HiOutlineClipboardList className="w-4 h-4" />
                            ) : (
                              <HiOutlineSupport className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-xs font-bold text-gray-800 truncate">{notif.title}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-tight">{notif.message}</p>
                            <span className="text-[9px] text-gray-400 block mt-1">{formatRelativeTime(notif.sentAt)}</span>
                          </div>
                          {!notif.isRead && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FFA700]" title="Nueva" />
                          )}
                        </button>
                      );
                    })}
                    {hasMore && (
                      <button
                        onClick={loadMore}
                        className="w-full py-2.5 text-center text-xs font-semibold text-[#FFA700] hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        Cargar más
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-gray-200" />

        {/* Avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((p) => !p)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                       hover:bg-gray-50 transition-colors focus:outline-none"
          >
            {user?.url_photo ? (
              <img
                src={user.url_photo}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-100 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500
                              flex items-center justify-center text-white text-sm font-bold shrink-0">
                {userInitial}
              </div>
            )}
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-[90px]">
                {user?.name ?? 'Usuario'}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight truncate max-w-[90px]">
                {user?.rol_name ?? 'Sin rol'}
              </p>
            </div>
            <FiChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {isUserMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl
                         shadow-lg border border-gray-100 overflow-hidden z-50"
              style={{ animation: 'dropIn 0.15s ease forwards' }}
            >
              <style>{`
                @keyframes dropIn {
                  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
              <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email ?? ''}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-medium">
                  {user?.rol_name ?? 'Sin rol'}
                </span>
              </div>
              <div className="py-1.5">
<button
  onClick={() => { setIsUserMenuOpen(false); navigate('/profile'); }}
  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
>
  <FiUser className="w-4 h-4 text-gray-400" />
  Mi perfil
</button>
<button
  onClick={() => { setIsUserMenuOpen(false); navigate('/security'); }}
  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
>
  <FiSettings className="w-4 h-4 text-gray-400" />
  Seguridad
</button>
              </div>
              <div className="border-t border-gray-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
