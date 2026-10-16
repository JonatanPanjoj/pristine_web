import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { FiChevronUp } from 'react-icons/fi';
import { SlideBar } from '../navbar/SlideBar';
import TopBar from './TopBar';
import { RootState } from '../../store/store';
import { useSessionExpiration } from '../../hooks/useSessionExpiration';
import SessionExpiredModal from '../../components/SessionExpiredModal';

const SIDEBAR_EXPANDED = 256; // w-64
const SIDEBAR_COLLAPSED = 80;  // w-20
const TOPBAR_H = 60;  // h-[60px]

interface ProtectedRouteLayoutProps {
  children?: React.ReactNode;
}

const ProtectedRouteLayout: React.FC<ProtectedRouteLayoutProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();
  const sessionExpired = useSessionExpiration(Boolean(user));

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsMinimized(true);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);
  const toggleMinimize = useCallback(() => setIsMinimized((p) => !p), []);

  // El aviso va antes de la redirección: al vencer, la sesión ya se cerró y sin
  // esto el usuario saldría a /login sin llegar a leer por qué.
  if (sessionExpired) {
    return <SessionExpiredModal onConfirm={() => navigate('/login', { replace: true })} />;
  }

  if (!user) return <Navigate to="/login" replace />;

  // Para el <main> (flujo normal) sí funciona margin-left de Tailwind
  const marginLeft = isMobile ? 0 : isMinimized ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="min-h-screen bg-[#F6F7FD]">

      {/* Sidebar — ya no tiene botones flotantes propios */}
      <SlideBar
        isMinimized={isMinimized}
        toggleMinimize={toggleMinimize}
        isMobile={isMobile}
      />

      {/* TopBar — dueño del toggle, left en px calculado internamente */}
      <TopBar
        user={user}
        isMinimized={isMinimized}
        isMobile={isMobile}
        onToggleSidebar={toggleMinimize}
      />

      {/* Contenido — margin-left en px para sincronía exacta con el sidebar */}
      <main
        className="transition-all duration-300 ease-in-out min-h-screen"
        style={{
          marginLeft: marginLeft,
          paddingTop: TOPBAR_H,
        }}
      >
        <div className="p-5 md:p-6">
          {children ?? <Outlet />}
        </div>
      </main>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Volver al inicio"
          className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full
                     flex items-center justify-center text-white
                     bg-gradient-to-br from-orange-500 to-orange-600
                     shadow-lg shadow-orange-200
                     hover:-translate-y-0.5 hover:shadow-xl
                     active:translate-y-0
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          style={{ animation: 'fadeUpBtn 0.2s ease forwards' }}
        >
          <style>{`
            @keyframes fadeUpBtn {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <FiChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ProtectedRouteLayout;
