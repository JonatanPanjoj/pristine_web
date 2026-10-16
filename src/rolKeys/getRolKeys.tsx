// useRoles.ts

import { useMemo } from 'react';

// Definimos la estructura de un rol
interface Role {
  name: string;
  key: string;
}

// Lista de roles organizados por menú
const roles: Role[] = [
  // Gestores Técnicos
  { name: "userManager", key: "GUSU" },
  { name: "Gestor de Grupos de Permisos", key: "GRUPPERM" },



  { name: "permissionManager", key: "GPERM" },

  { name: "Asignación de Roles a cada Usuario", key: "ASIROL" },


  { name: "Gestor de Roles", key: "NEWROL" },


  { name: "profileUser", key: "PERFIL" },
  { name: "PassUser", key: "PERFIL" },
  { name: "usersLocations", key: "USUSED" },
  { name: "usersCategories", key: "USUCAT" },
  { name: "sedesManager", key: "GETSE" },
  { name: "sectorManager", key: "GESTA" },
  {name: "areaManager", key: 'GETAR'},
  {name: "checklistConfig", key: 'GETAR'},
  {name: 'GenerateQR', key: 'GENQR'},
  { name: "automaticReports", key: "REPAUTO" },
  // Checklist
  { name: "checkListManager", key: "GESCHK" },
  { name: "categoryChecklist", key: "CATCHK" },



  { name: "registerReviewWeb", key: "REGREVWEB" },
  { name:'review&results', key: 'REVRESULT'},

  { name: "checklistReports", key: "REPCHK" },
  { name: "Gestor de Horarios de Revisión", key: "GESTHOR" },
  { name: "Gestor de Preguntas", key: "GESTPREG" },
  { name: "Gestor de Status", key: "GESTSTATUS" },

{ name: "reviewScheduleManager", key: "GESTHOR" },
{ name: "questionManager", key: "GESTPREG" },






{ name: "statusManager", key: "GESTSTATUS" },


  // Help Desk
  { name: "ticketManager", key: "GTIC" },
  { name: "HelpDeskPrioritiesManager", key: "GESTPRIO" },

  { name: "categoriaHelpDeskView", key: "CATHD" },
  { name: "Aperturar Ticket", key: "NEWTICKET" },
  { name: "Tramitar Tickets Asignados", key: "GESTTICKET" },
  { name: "Cerrar Tickets", key: "CLOSETICKET" },
  { name: "Reportes de HelpDesk", key: "REPHD" },
  // PPM
  { name: "Permisos Generales del Módulo", key: "GESTPPM" },
  { name: "Categorías (PPM)", key: "CATPPM" },
  { name: "Gestor de Tipos de Incidentes", key: "GESTIPOINC" },
  { name: "incidentManager", key: "GESTIPOINC" },
  // Auditoría
  { name: "Permisos Generales del Módulo", key: "GESTAUDIT" },
  { name: "Categorías (Auditoría)", key: "CATAUDIT" },
  { name: "auditoriaManager", key: "GESTAUDIT" },
  { name: "auditoriaEdit", key: "EDITAUDIT" },
  { name: "auditoriaReports", key: "REPAUDIT" },
  // Otros
  { name: "Revisión y Resultados", key: "REVRESULT" },
  { name: "Generador de QR", key: "GENQR" },
];

// Hook personalizado para obtener claves de rol
const useRoles = () => {
  // Función para obtener la clave de un rol por su nombre
  const getRoleKeyByName = (roleName: string): string | null => {
    const role = roles.find(r => r.name === roleName);
    return role ? role.key : null;
  };

  return { getRoleKeyByName, roles };
};

export default useRoles;
