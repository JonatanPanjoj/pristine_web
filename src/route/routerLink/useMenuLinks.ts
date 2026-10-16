import { useMemo } from 'react';

// Definir el tipo de enlace con nombre y ruta
interface LinkItem {
  name: string;
  link: string;
}

// Crear el hook personalizado
const useMenuLinks = () => {
  // Definir la lista de enlaces con nombres y rutas en inglés
  const links = useMemo<LinkItem[]>(() => [
    { name: 'userManager', link: '/administration/user-manager' },
    { name: 'permissionManager', link: '/administration/permission-manager' },
    { name: 'permissionManagerADDRol', link: '/administration/permission-manager/Add-Rol' },
    { name: 'permissionManagerADDPermission', link: '/administration/permission-manager/permisions' },
    { name: 'roleDetail', link: '/administration/permission-manager/role/:roleId' },

    { name: 'usersLocations', link: '/administration/users-locations' },
    { name: 'versionManager', link: '/administration/version-manager' },


    { name: 'sedesManager', link: '/technicalManagers/sede-manager'},
    { name: 'sectorManager', link: '/technicalManagers/sector-manager'},
    { name: 'areaManager', link: '/technicalManagers/area-manager'},
    { name: "categoryChecklist", link: "/technicalManagers/category-Checklist" },
    { name: "categoriaHelpDeskView", link: "/technicalManagers/category-helpdesk" },

    
    { name: "GenerateQR", link: "/technicalManagers/GenerateQR" },
    { name: "checklistConfig", link: "/technicalManagers/checklist-config" },
    { name: "automaticReports", link: "/technicalManagers/automatic-reports" },



    { name: "checklistDashboard", link: "/checkList/dashboard" },
    { name: "checkListManager", link: "/checkList/Checklist-Manager" },
    { name: "registerReviewWeb", link:  "/checkList/Register-Review" },

    { name:'review&results', link: "/checkList/Review-And-Results"},
    { name: 'usersCategories', link: '/checkList/users-categories' },
    { name: "checklistReports", link: "/checkList/Reports" },
    { name: "checklistReportResult", link: "/checkList/Reports/result/:resultId" },
    { name: "ChecklistView", link: "/checkList" },


    { name: "HelpDeskPrioritiesManager", link: "/checkList/Priorities-Manager" },
    { name: "incidentManager", link: "/administration/incidents" },
    { name: "statusManager", link: "/administration/statuses" },
    { name: "ticketManager", link: "/tickets" },
    { name: "helpdeskDashboard", link: "/helpdesk/dashboard" },
    { name: "helpdeskReports", link: "/helpdesk/Reports" },

    { name: "profileUser", link: "/profile" },
    { name: "PassUser", link: "/security" },
    { name: "ticketDetail", link: "/tickets/:ticketId" },
    { name: "revisionDetail", link: "/checkList/revisions/:revisionId" },

    // PPM Module
    { name: "ppmDashboard", link: "/ppm/dashboard" },
    { name: "ppmSchedules", link: "/ppm/schedules" },
    { name: "ppmFailureReports", link: "/ppm/failure-reports" },
    { name: "ppmWarehouse", link: "/ppm/warehouse" },
    { name: "ppmAssets", link: "/ppm/assets" },
    { name: "ppmCategories", link: "/ppm/categories" },
    { name: "ppmQuestionnaires", link: "/ppm/questionnaires" },
    { name: "ppmWorkOrders", link: "/ppm/work-orders" },
    { name: "ppmProviders", link: "/ppm/providers" },
    { name: "ppmActivities", link: "/ppm/activities" },
    { name: "ppmReports", link: "/ppm/reports" },
    { name: "ppmReportResult", link: "/ppm/reports/result/:resultId" },
    { name: "ppmScheduleDetail", link: "/ppm/schedules/:id" },
    { name: "ppmFailureReportDetail", link: "/ppm/failure-reports/:id" },
    { name: "ppmAssetDetail", link: "/ppm/assets/:id" },
    { name: "ppmQuestionnaireDetail", link: "/ppm/questionnaires/:id" },
    { name: "ppmWorkOrderDetail", link: "/ppm/work-orders/:id" },

    // Auditoría Module
    { name: "auditoriaDashboard", link: "/auditoria/dashboard" },
    { name: "auditoriaRevisions", link: "/auditoria/revisions" },
    { name: "auditoriaTemplates", link: "/auditoria/templates" },
    { name: "auditoriaSchedules", link: "/auditoria/schedules" },
    { name: "auditoriaScheduleDetail", link: "/auditoria/schedules/:scheduleId" },
    { name: "auditoriaCatalogs", link: "/auditoria/catalogs" },
    { name: "auditoriaFindings", link: "/auditoria/hallazgos" },
    { name: "auditoriaFindingDetail", link: "/auditoria/hallazgos/:ticketCode" },
    { name: "auditoriaFindingCatalogs", link: "/auditoria/estados-prioridades" },
    { name: "auditoriaReports", link: "/auditoria/reports" },
    { name: "auditoriaRevisionDetail", link: "/auditoria/revisions/:revisionId" },
    { name: "auditoriaRevisionSection", link: "/auditoria/revisions/:revisionId/secciones/:sectionId" },
    { name: "auditoriaRevisionPlan", link: "/auditoria/revisions/:revisionId/plan" },
    { name: "auditoriaPlanSection", link: "/auditoria/revisions/:revisionId/plan/secciones/:sectionId" },
  ], []);

  // Función para obtener el enlace basado en el nombre
  const getLinkByName = (name: string) => {
    const linkItem = links.find(item => item.name === name);
    return linkItem ? linkItem.link : '#'; // Retorna '#' si no encuentra el enlace
  };

  return { getLinkByName, links };
};

export default useMenuLinks;
