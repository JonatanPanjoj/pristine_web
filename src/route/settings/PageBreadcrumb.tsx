import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

// Mueve tus constantes de etiquetas a un archivo separado (ej. constants/routes.ts) 
// para compartirlas entre TopBar y este nuevo componente.
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

const PageBreadcrumb: React.FC = () => {
  const { pathname } = useLocation();

  const getBreadcrumb = (path: string): string[] => {
    if (path === '/') return ['Inicio'];
    const segments = path.split('/').filter(Boolean);
    const parts: string[] = [];
    if (segments[0]) parts.push(SECTION_LABELS[segments[0]] ?? segments[0]);

    let pageLabel = ROUTE_LABELS[path];
    if (!pageLabel) {
      if (path.startsWith('/tickets/')) {
        pageLabel = 'Detalle de Ticket';
      } else if (path.startsWith('/checkList/revisions/')) {
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

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="h-10 px-6 flex items-center bg-white border-b border-gray-100">
      <nav className="flex items-center gap-1.5">
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={`${crumb}-${i}`}>
            {i > 0 && <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            <span className={`text-[13px] ${i === breadcrumb.length - 1 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default PageBreadcrumb;