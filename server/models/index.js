const mongoose = require('mongoose');

// Helper para agregar id como alias de _id en JSON
const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
};

// 1. Usuarios (auth_users)
const UserSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  status: { type: Boolean, default: true },
  is_enabled: { type: Boolean, default: true },
  rol: { type: String, default: 'admin' },
  role_id: { type: String, default: '' },
  permissions: [{ type: String }],
  permissions_source: { type: String, default: 'usuario' },
  language: { type: String, default: null },
  notifications_enabled: { type: Boolean, default: false },
  personal_answer: { type: String, default: '' },
  personal_question: { type: String, default: '' },
  url_photo: { type: String, default: null },
  user_id: { type: Number, default: 0 },
  sedes: [{ type: String }],
  categories: [{ type: String }],
  search_keywords: [{ type: String }],
  fcm_tokens: [{ type: String }],
}, schemaOptions);

// 2. Roles (auth_roles)
const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  permissions: [{ type: String }],
  status: { type: Boolean, default: true },
  is_enabled: { type: Boolean, default: true },
}, schemaOptions);

// 3. Permisos (auth_permissions)
const PermissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  module: { type: String, default: '' },
  description: { type: String, default: '' },
}, schemaOptions);

// 4. Sedes (core_sedes)
const SedeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  is_enabled: { type: Boolean, default: true },
  user_ids: [{ type: String }],
  sector: [{ type: String }],
  zone: { type: String, default: '' },
  department: { type: String, default: '' },
  municipality: { type: String, default: '' },
  url_photo: { type: String, default: null },
  fechas_feriado: [{ type: String }],
}, schemaOptions);

// 5. Sectores (core_sectors)
const SectorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sede_id: { type: String, index: true },
  SedeId: { type: String, index: true },
  description: { type: String, default: '' },
  status: { type: Boolean, default: true },
  is_enabled: { type: Boolean, default: true },
  sector_id: { type: String, default: '' },
  sec_Area: [{ type: String }],
}, schemaOptions);

// 6. Áreas (core_areas)
const AreaSchema = new mongoose.Schema({
  area_id: { type: Number, default: () => Date.now() },
  name: { type: String, required: true },
  sector_id: { type: String, index: true },
  SectorId: { type: String, index: true },
  sede_id: { type: String, index: true },
  SedeId: { type: String, index: true },
  level: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: Boolean, default: true },
  is_enabled: { type: Boolean, default: true },
}, schemaOptions);

// 7. Categorías de Checklist (checklist_categories)
const CategoryChecklistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: Boolean, default: true },
  is_enabled: { type: Boolean, default: true },
  color: { type: String, default: '#389CD6' },
  categoria_id: { type: String, default: '' },
  users_id: [{ type: String }],
}, schemaOptions);

// 8. Configuración de Checklist (checklist_settings)
const ChecklistConfigSchema = new mongoose.Schema({
  days_ahead: { type: Number, default: 3 },
  max_score: { type: Number, default: 100 },
  allow_photo_gallery: { type: Boolean, default: true },
  notifications_active: { type: Boolean, default: true },
}, schemaOptions);

// 9. Checklist / Plantillas (checklist_checklists)
const ChecklistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category_id: { type: String, index: true },
  categoryId: { type: String, index: true },
  categoryName: { type: String, default: '' },
  needPhoto: { type: Boolean, default: false },
  needFirm: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: true },
  status: { type: Boolean, default: true },
  questions: [{ type: mongoose.Schema.Types.Mixed }],
  items: [{ type: mongoose.Schema.Types.Mixed }],
}, schemaOptions);

// 10. Programaciones de Checklist (checklist_schedules)
const ChecklistScheduleSchema = new mongoose.Schema({
  checklist_id: { type: String, index: true },
  checklistId: { type: String, index: true },
  checklist_name: { type: String, default: '' },
  checklistName: { type: String, default: '' },
  sede_id: { type: String, index: true },
  sedeId: { type: String, index: true },
  sector_id: { type: String, default: '', index: true },
  sectorId: { type: String, default: '', index: true },
  area_id: { type: mongoose.Schema.Types.Mixed, default: null },
  areaId: { type: mongoose.Schema.Types.Mixed, default: null },
  user_id: { type: String, default: '' },
  userId: { type: String, default: '' },
  startTime: { type: String, default: '08:00' },
  endTime: { type: String, default: '17:00' },
  activeDays: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false },
  },
  isEnabled: { type: Boolean, default: true },
  observations: { type: String, default: '' },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, default: null },
  frequency: { type: String, default: 'daily' },
  status: { type: String, default: 'active' }, // active, completed, cancelled
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
}, schemaOptions);

// 11. Revisiones y Resultados de Checklist (checklist_revisions)
const ChecklistRevisionSchema = new mongoose.Schema({
  custom_id: { type: String, default: '', index: true },
  correlativo: { type: Number, index: true },
  numeroRevision: { type: Number },
  code: { type: String, default: '', index: true },
  sequentialId: { type: Number },
  schedule_id: { type: String, default: '', index: true },
  scheduleId: { type: String, default: '', index: true },
  checklist_id: { type: String, index: true },
  checklistId: { type: String, index: true },
  checklist_name: { type: String, default: '' },
  checklist: { type: mongoose.Schema.Types.Mixed },
  sede_id: { type: String, index: true },
  sedeId: { type: String, index: true },
  sector_id: { type: String, default: '' },
  sectorId: { type: String, default: '' },
  area_id: { type: mongoose.Schema.Types.Mixed, default: null },
  areaId: { type: mongoose.Schema.Types.Mixed, default: null },
  location: { type: mongoose.Schema.Types.Mixed },
  scheduleSnapshot: { type: mongoose.Schema.Types.Mixed },
  user_id: { type: String, default: '' },
  userId: { type: String, default: '' },
  user_name: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.Mixed },
  supervisor: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, default: 'pending', index: true }, // completed, in_progress, pending
  score: { type: Number, default: 100 },
  answers: [{ type: mongoose.Schema.Types.Mixed }],
  photos: [{ type: String }],
  comments: { type: String, default: '' },
  observations: { type: String, default: '' },
  signatureUrl: { type: String, default: null },
  PhotoUrl: { type: String, default: null },
  photoUrls: [{ type: String }],
  PhotoUrls: [{ type: String }],
  startDate: { type: String, default: '' },
  endDate: { type: String, default: null },
  durationSeconds: { type: Number, default: null },
  revision_date: { type: Date, default: Date.now, index: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret.custom_id || ret.code || ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

// 12. Versiones de App (system_app_versions)
const AppVersionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  release_date: { type: Date, default: Date.now },
  description: { type: String, default: '' },
  platform: { type: String, default: 'web' },
  force_update: { type: Boolean, default: false },
}, schemaOptions);

// 13. Reportes Automáticos (system_automatic_reports)
const AutomaticReportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  report_type: { type: String, default: 'checklist' },
  frequency: { type: String, default: 'weekly' },
  emails: [{ type: String }],
  active: { type: Boolean, default: true },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
}, schemaOptions);

// 14. Estadísticas Mensuales de Checklist (checklist_monthly_stats)
const ChecklistMonthlyStatsSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  sede_id: { type: String, default: '' },
  total_schedules: { type: Number, default: 0 },
  completed_revisions: { type: Number, default: 0 },
  compliance_percentage: { type: Number, default: 100 },
}, schemaOptions);

// 15. Notificaciones del Sistema (system_notifications)
const SystemNotificationSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'checklist_reminder' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
}, schemaOptions);

module.exports = {
  User: mongoose.model('User', UserSchema, 'auth_users'),
  Role: mongoose.model('Role', RoleSchema, 'auth_roles'),
  Permission: mongoose.model('Permission', PermissionSchema, 'auth_permissions'),
  Sede: mongoose.model('Sede', SedeSchema, 'core_sedes'),
  Sector: mongoose.model('Sector', SectorSchema, 'core_sectors'),
  Area: mongoose.model('Area', AreaSchema, 'core_areas'),
  CategoryChecklist: mongoose.model('CategoryChecklist', CategoryChecklistSchema, 'checklist_categories'),
  ChecklistCategory: mongoose.model('CategoryChecklist', CategoryChecklistSchema, 'checklist_categories'),
  ChecklistConfig: mongoose.model('ChecklistConfig', ChecklistConfigSchema, 'checklist_settings'),
  Checklist: mongoose.model('Checklist', ChecklistSchema, 'checklist_checklists'),
  ChecklistSchedule: mongoose.model('ChecklistSchedule', ChecklistScheduleSchema, 'checklist_schedules'),
  ChecklistRevision: mongoose.model('ChecklistRevision', ChecklistRevisionSchema, 'checklist_revisions'),
  ChecklistMonthlyStats: mongoose.model('ChecklistMonthlyStats', ChecklistMonthlyStatsSchema, 'checklist_monthly_stats'),
  AppVersion: mongoose.model('AppVersion', AppVersionSchema, 'system_app_versions'),
  AutomaticReport: mongoose.model('AutomaticReport', AutomaticReportSchema, 'system_automatic_reports'),
  SystemNotification: mongoose.model('SystemNotification', SystemNotificationSchema, 'system_notifications'),
};

