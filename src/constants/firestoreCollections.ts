export const FIRESTORE_COLLECTIONS = {
  // HelpDesk Module
  HELPDESK_TICKETS: 'helpdesk_tickets',
  HELPDESK_CATEGORIES: 'helpdesk_categories',
  HELPDESK_INCIDENTS: 'helpdesk_incidents',
  HELPDESK_PRIORITIES: 'helpdesk_priorities',
  HELPDESK_STATUSES: 'helpdesk_statuses',

  // Checklist Module
  CHECKLIST_CHECKLISTS: 'checklist_checklists',
  CHECKLIST_REVISIONS: 'checklist_revisions',
  CHECKLIST_SCHEDULES: 'checklist_schedules',
  CHECKLIST_CATEGORIES: 'checklist_categories',
  CHECKLIST_MONTHLY_STATS: 'checklist_monthly_stats',
  CHECKLIST_SETTINGS: 'checklist_settings',

  // Core / Location Domain
  CORE_SEDES: 'core_sedes',
  CORE_SECTORS: 'core_sectors',
  CORE_AREAS: 'core_areas',
  CORE_DEPARTMENTS_COUNTRY: 'core_departments_country',

  // Auth Domain
  AUTH_USERS: 'auth_users',
  AUTH_ROLES: 'auth_roles',
  AUTH_PERMISSIONS: 'auth_permissions',
  AUTH_PASSWORD_RESETS: 'auth_password_resets',

  // System Domain
  SYSTEM_NOTIFICATIONS: 'system_notifications',
  SYSTEM_APP_VERSIONS: 'system_app_versions',
  SYSTEM_AUTOMATIC_REPORTS: 'system_automatic_reports',

  // PPM Module
  PPM_SCHEDULES: 'ppm_schedules',
  PPM_FAILURE_REPORTS: 'ppm_failure_reports',
  PPM_WAREHOUSE_INVENTORY: 'ppm_warehouse_inventory',
  PPM_MATERIAL_USAGES: 'ppm_material_usages',
  PPM_ASSETS: 'ppm_assets',
  PPM_CATEGORIES: 'ppm_categories',
  PPM_DASHBOARD_STATS: 'ppm_dashboard_stats',
  PPM_QUESTIONNAIRES: 'ppm_questionnaires',
  PPM_WORK_ORDERS: 'ppm_work_orders',
  PPM_PROVIDERS: 'ppm_providers',
  PPM_ACTIVITIES: 'ppm_activities',
  PPM_COUNTERS: 'ppm_counters',
  AUDITORIA_COUNTERS: 'auditoria_counters',
} as const;

export type FirestoreCollectionName = typeof FIRESTORE_COLLECTIONS[keyof typeof FIRESTORE_COLLECTIONS];
