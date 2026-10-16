const mongoose = require('mongoose');
require('dotenv').config();
const { User, Role, Permission, Sede, Sector, Area, ChecklistCategory, ChecklistConfig } = require('./models');

// Función de cifrado compatible con useEncryptDecrypt
const substrReact = (str, start, length) => {
  if (start < 0) {
    str = str.split('').reverse().join('');
    start = -1 * start - 1;
    return str.slice(start, start + length);
  }
  return length === undefined ? str.slice(start) : str.slice(start, start + length);
};

const encrypt = (string, key) => {
  let result = '';
  for (let i = 0; i < string.length; i++) {
    const char = string.charAt(i);
    const keyChar = substrReact(key, (i % key.length) - 1, 1);
    const encryptedChar = String.fromCharCode(char.charCodeAt(0) + keyChar.charCodeAt(0));
    result += encryptedChar;
  }
  return Buffer.from(result, 'binary').toString('base64');
};

// Catálogo completo de permisos del sistema organizados por módulo
const permissionsData = [
  // ── 1. Módulo de Administración del Sistema ──
  { key: 'GUSU', name: 'Gestor de usuarios', module: 'Administración' },
  { key: 'userManager', name: 'Gestor de usuarios (Alias)', module: 'Administración' },
  { key: 'REPUSU', name: 'Reporte de Usuarios (PDF y EXCEL)', module: 'Administración' },
  { key: 'GRUPPERM', name: 'Gestor de Grupos de Permisos', module: 'Administración' },
  { key: 'GPERM', name: 'Gestor de Permisos', module: 'Administración' },
  { key: 'permissionManager', name: 'Gestor de Permisos (Alias)', module: 'Administración' },
  { key: 'NEWROL', name: 'Gestor de Roles', module: 'Administración' },
  { key: 'ASIROL', name: 'Asignación de Roles a cada Usuario', module: 'Administración' },
  { key: 'USUSED', name: 'Asignación de Usuarios a Sedes', module: 'Administración' },
  { key: 'usersLocations', name: 'Asignación de Usuarios a Sedes (Alias)', module: 'Administración' },
  { key: 'USUCAT', name: 'Asignación de Usuarios a Categorías del CheckList', module: 'Administración' },
  { key: 'usersCategories', name: 'Asignación de Usuarios a Categorías del CheckList (Alias)', module: 'Administración' },
  { key: 'PassUser', name: 'Seguridad / Clave', module: 'Administración' },
  { key: 'profileUser', name: 'Perfil de Usuario', module: 'Administración' },

  // ── 2. Módulo de Inicio / Perfil ──
  { key: 'PERFIL', name: 'Actualización de Perfil y Credenciales', module: 'Inicio' },

  // ── 3. Módulo de Gestores Técnicos ──
  { key: 'GETSE', name: 'Gestor de Sedes', module: 'Técnicos' },
  { key: 'sedesManager', name: 'Gestor de Sedes (Alias)', module: 'Técnicos' },
  { key: 'GESTA', name: 'Gestor de Sector / Torre', module: 'Técnicos' },
  { key: 'sectorManager', name: 'Gestor de Sector / Torre (Alias)', module: 'Técnicos' },
  { key: 'GETAR', name: 'Gestor de Áreas', module: 'Técnicos' },
  { key: 'areaManager', name: 'Gestor de Áreas (Alias)', module: 'Técnicos' },
  { key: 'CATCHK', name: 'Categorías (Check List)', module: 'Técnicos' },
  { key: 'categoryChecklist', name: 'Categorías (Check List) (Alias)', module: 'Técnicos' },
  { key: 'CATHD', name: 'Categorías (Help Desk)', module: 'Técnicos' },
  { key: 'categoriaHelpDeskView', name: 'Categorías (Help Desk) (Alias)', module: 'Técnicos' },
  { key: 'CATAUDIT', name: 'Categorías (Auditoría)', module: 'Técnicos' },
  { key: 'CATPPM', name: 'Categorías (PPM)', module: 'Técnicos' },
  { key: 'GENQR', name: 'Generador de QR', module: 'Técnicos' },
  { key: 'GenerateQR', name: 'Generador de QR (Alias)', module: 'Técnicos' },
  { key: 'REPAUTO', name: 'Reportes Automáticos', module: 'Técnicos' },
  { key: 'automaticReports', name: 'Reportes Automáticos (Alias)', module: 'Técnicos' },
  { key: 'checklistConfig', name: 'Configuración de Checklist', module: 'Técnicos' },

  // ── 4. Módulo de Check List ──
  { key: 'ChecklistView', name: 'Dashboard de Checklist', module: 'Checklist' },
  { key: 'GESCHK', name: 'Gestor de Check List', module: 'Checklist' },
  { key: 'checkListManager', name: 'Gestor de Check List (Alias)', module: 'Checklist' },
  { key: 'GESTPREG', name: 'Gestor de Preguntas', module: 'Checklist' },
  { key: 'questionManager', name: 'Gestor de Preguntas (Alias)', module: 'Checklist' },
  { key: 'GESTHOR', name: 'Gestor de Horarios de Revisión', module: 'Checklist' },
  { key: 'reviewScheduleManager', name: 'Gestor de Horarios de Revisión (Alias)', module: 'Checklist' },
  { key: 'REGREVWEB', name: 'Registro de Revisión Web', module: 'Checklist' },
  { key: 'registerReviewWeb', name: 'Registro de Revisión Web (Alias)', module: 'Checklist' },
  { key: 'REVRESULT', name: 'Revisión y Resultados', module: 'Checklist' },
  { key: 'review&results', name: 'Revisión y Resultados (Alias)', module: 'Checklist' },
  { key: 'REPCHK', name: 'Reportes de CheckList', module: 'Checklist' },
  { key: 'checklistReports', name: 'Reportes de CheckList (Alias)', module: 'Checklist' },

  // ── 5. Módulo de Help Desk ──
  { key: 'GESTPRIO', name: 'Gestor de Prioridades', module: 'Help Desk' },
  { key: 'HelpDeskPrioritiesManager', name: 'Gestor de Prioridades (Alias)', module: 'Help Desk' },
  { key: 'GESTSTATUS', name: 'Gestor de Status', module: 'Help Desk' },
  { key: 'statusManager', name: 'Gestor de Status (Alias)', module: 'Help Desk' },
  { key: 'GESTIPOINC', name: 'Gestor de Tipos de Incidentes', module: 'Help Desk' },
  { key: 'incidentManager', name: 'Gestor de Tipos de Incidentes (Alias)', module: 'Help Desk' },
  { key: 'NEWTICKET', name: 'Aperturar Ticket', module: 'Help Desk' },
  { key: 'GESTTICKET', name: 'Tramitar Tickets Asignados', module: 'Help Desk' },
  { key: 'ticketManager', name: 'Tramitar Tickets Asignados (Alias)', module: 'Help Desk' },
  { key: 'CLOSETICKET', name: 'Cerrar Tickets', module: 'Help Desk' },
  { key: 'REPHD', name: 'Reportes de HelpDesk', module: 'Help Desk' },

  // ── 6. Módulo de Auditoría ──
  { key: 'GESTAUDIT', name: 'Permisos Generales del Módulo de Auditoría', module: 'Auditoría' },
  { key: 'auditoriaManager', name: 'Permisos Generales de Auditoría (Alias)', module: 'Auditoría' },
  { key: 'AUDITPRO', name: 'Permiso para programar auditorías', module: 'Auditoría' },
  { key: 'AUDITREP', name: 'Seguimiento al reporte de auditoría', module: 'Auditoría' },
  { key: 'AUDITPLAN', name: 'Seguimiento del plan de acción', module: 'Auditoría' },
  { key: 'AUDITPLANR', name: 'Lectura de reporte del plan de acción', module: 'Auditoría' },
  { key: 'AUDITRESUL', name: 'Revisión de resultados de auditorías', module: 'Auditoría' },
  { key: 'AUDITGRAFI', name: 'Tablero y Gráficos de auditoría', module: 'Auditoría' },
  { key: 'AUDITREAUD', name: 'Ejecución de auditorías (App y Web)', module: 'Auditoría' },
  { key: 'AUDITMAIL', name: 'Configuración de correos de auditoría', module: 'Auditoría' },
  { key: 'REPAUDIT', name: 'Reportes de Auditoría', module: 'Auditoría' },
  { key: 'auditoriaReports', name: 'Reportes de Auditoría (Alias)', module: 'Auditoría' },
  { key: 'EDITAUDIT', name: 'Edición de Auditoría', module: 'Auditoría' },

  // ── 7. Módulo PPM (Mantenimiento) ──
  { key: 'GESTPPM', name: 'Permisos Generales del Módulo PPM', module: 'PPM' },
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pristine';
    console.log(`Conectando a MongoDB para sembrar datos: ${uri}`);
    await mongoose.connect(uri);

    console.log('Limpiando colecciones base...');
    await Promise.all([
      Permission.deleteMany({}),
      Role.deleteMany({}),
      User.deleteMany({}),
      Sede.deleteMany({}),
      Sector.deleteMany({}),
      Area.deleteMany({}),
      ChecklistCategory.deleteMany({}),
      ChecklistConfig.deleteMany({}),
    ]);

    // 1. Crear permisos
    console.log('Sembrando catálogo de permisos...');
    const createdPermissions = await Permission.insertMany(permissionsData);
    const permissionKeys = createdPermissions.map(p => p.key);

    // 2. Definición de Roles relacionados con los permisos del sistema
    console.log('Sembrando roles estructurados...');
    const rolesDefinitions = [
      {
        name: 'Super Administrador',
        description: 'Acceso total y sin restricciones a todos los módulos y funciones de Pristine',
        permissions: permissionKeys,
        status: true,
        is_enabled: true,
      },
      {
        name: 'Administrador del Sistema',
        description: 'Gestión integral de usuarios, asignación de roles, sedes, sectores, áreas y reportes automáticos',
        permissions: [
          'GUSU', 'userManager', 'REPUSU', 'GRUPPERM', 'GPERM', 'permissionManager',
          'NEWROL', 'ASIROL', 'USUSED', 'usersLocations', 'USUCAT', 'usersCategories',
          'PassUser', 'profileUser', 'PERFIL', 'GETSE', 'sedesManager', 'GESTA',
          'sectorManager', 'GETAR', 'areaManager', 'GENQR', 'GenerateQR', 'REPAUTO',
          'automaticReports', 'checklistConfig',
        ],
        status: true,
        is_enabled: true,
      },
      {
        name: 'Supervisor Técnico',
        description: 'Supervisión de operaciones en sedes, gestión de checklists, horarios, preguntas y control de help desk',
        permissions: [
          'GETSE', 'sedesManager', 'GESTA', 'sectorManager', 'GETAR', 'areaManager',
          'CATCHK', 'categoryChecklist', 'CATHD', 'categoriaHelpDeskView', 'CATPPM',
          'CATAUDIT', 'GENQR', 'GenerateQR', 'REPAUTO', 'automaticReports',
          'checklistConfig', 'ChecklistView', 'GESCHK', 'checkListManager', 'GESTPREG',
          'questionManager', 'GESTHOR', 'reviewScheduleManager', 'REGREVWEB',
          'registerReviewWeb', 'REVRESULT', 'review&results', 'REPCHK', 'checklistReports',
          'USUCAT', 'usersCategories', 'GESTPRIO', 'HelpDeskPrioritiesManager',
          'GESTSTATUS', 'statusManager', 'GESTIPOINC', 'incidentManager', 'NEWTICKET',
          'GESTTICKET', 'ticketManager', 'CLOSETICKET', 'REPHD', 'GESTPPM', 'PERFIL',
        ],
        status: true,
        is_enabled: true,
      },
      {
        name: 'Técnico de Checklist',
        description: 'Personal operativo en campo: ejecución de revisiones web, consulta de horarios y apertura de tickets',
        permissions: [
          'ChecklistView', 'REGREVWEB', 'registerReviewWeb', 'REVRESULT',
          'review&results', 'GESTHOR', 'reviewScheduleManager', 'NEWTICKET',
          'PERFIL', 'PassUser', 'profileUser',
        ],
        status: true,
        is_enabled: true,
      },
      {
        name: 'Agente de Mesa de Ayuda',
        description: 'Atención de soporte Help Desk: apertura, gestión, trámite y resolución de tickets de incidencias',
        permissions: [
          'NEWTICKET', 'GESTTICKET', 'ticketManager', 'CLOSETICKET', 'REPHD',
          'CATHD', 'categoriaHelpDeskView', 'GESTPRIO', 'HelpDeskPrioritiesManager',
          'GESTSTATUS', 'statusManager', 'GESTIPOINC', 'incidentManager', 'PERFIL',
          'PassUser', 'profileUser',
        ],
        status: true,
        is_enabled: true,
      },
      {
        name: 'Auditor de Calidad y Procesos',
        description: 'Programación y ejecución de auditorías internas, seguimiento de planes de acción y análisis de resultados',
        permissions: [
          'GESTAUDIT', 'auditoriaManager', 'AUDITPRO', 'AUDITREP', 'AUDITPLAN',
          'AUDITPLANR', 'AUDITRESUL', 'AUDITGRAFI', 'AUDITREAUD', 'AUDITMAIL',
          'REPAUDIT', 'auditoriaReports', 'EDITAUDIT', 'CATAUDIT', 'PERFIL',
          'PassUser', 'profileUser',
        ],
        status: true,
        is_enabled: true,
      },
      {
        name: 'Planificador PPM',
        description: 'Gestión y seguimiento de planes de mantenimiento preventivo y predictivo de equipos e infraestructura',
        permissions: [
          'GESTPPM', 'CATPPM', 'GETSE', 'sedesManager', 'GESTA', 'sectorManager',
          'GETAR', 'areaManager', 'NEWTICKET', 'PERFIL',
        ],
        status: true,
        is_enabled: true,
      },
      {
        name: 'Consulta y Reportes (Solo Lectura)',
        description: 'Visualización gerencial de dashboards, seguimiento de resultados y descarga de reportes ejecutivos',
        permissions: [
          'REPUSU', 'REPAUTO', 'automaticReports', 'REPCHK', 'checklistReports',
          'REPHD', 'REPAUDIT', 'auditoriaReports', 'REVRESULT', 'review&results',
          'ChecklistView', 'AUDITGRAFI', 'PERFIL',
        ],
        status: true,
        is_enabled: true,
      },
    ];

    const createdRoles = await Role.insertMany(rolesDefinitions);
    const superAdminRole = createdRoles.find(r => r.name === 'Super Administrador');

    // 3. Crear Sedes iniciales
    console.log('Sembrando Sede demo...');
    const demoSede = new Sede({
      name: 'Sede Central',
      address: 'Avenida Principal 123',
      latitude: 14.6349,
      longitude: -90.5069,
      status: true,
      is_enabled: true,
      user_ids: [],
    });
    await demoSede.save();

    const demoSector = new Sector({
      name: 'Sector General',
      sede_id: demoSede._id.toString(),
      description: 'Sector administrativo y operativo',
      status: true,
    });
    await demoSector.save();

    const demoArea = new Area({
      area_id: 101,
      name: 'Área Técnica A',
      sector_id: demoSector._id.toString(),
      sede_id: demoSede._id.toString(),
      status: true,
    });
    await demoArea.save();

    // 4. Crear Categoría inicial de Checklist
    const demoCategory = new ChecklistCategory({
      name: 'Mantenimiento e Inspección',
      description: 'Inspecciones técnicas y chequeo de instalaciones',
      status: true,
      color: '#389CD6',
    });
    await demoCategory.save();

    // 5. Configuración de Checklist
    const config = new ChecklistConfig({
      days_ahead: 3,
      max_score: 100,
      allow_photo_gallery: true,
      notifications_active: true,
    });
    await config.save();

    // 6. Crear Usuario Admin
    const encryptedPass = encrypt('admin123', 'admin');
    console.log(`Clave encriptada para admin: ${encryptedPass}`);

    const adminUser = new User({
      user: 'admin',
      password: encryptedPass,
      name: 'Administrador Pristine',
      email: 'admin@pristine.com',
      phone: '555-0100',
      status: true,
      is_enabled: true,
      rol: superAdminRole._id.toString(),
      role_id: superAdminRole._id.toString(),
      sedes: [demoSede._id.toString()],
      categories: [demoCategory._id.toString()],
      search_keywords: ['admin', 'administrador', 'pristine'],
    });
    await adminUser.save();

    console.log('====================================================');
    console.log('  Base de Datos MongoDB de Pristine inicializada con éxito');
    console.log(`  Roles sembrados: ${createdRoles.length}`);
    createdRoles.forEach(r => console.log(`   - ${r.name} (${r.permissions.length} permisos)`));
    console.log('  Usuario admin creado:');
    console.log('    Usuario: admin');
    console.log('    Contraseña: admin123');
    console.log('  Sede Central, Sector, Área y Categoría creadas.');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
};

seedDatabase();
