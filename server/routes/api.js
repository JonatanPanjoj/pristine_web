const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const roleController = require('../controllers/roleController');
const locationController = require('../controllers/locationController');
const checklistController = require('../controllers/checklistController');
const miscController = require('../controllers/miscController');

// ── AUTH ──
router.post('/auth/login', authController.login);
router.post('/auth/change-password', authController.changePassword);

// ── USUARIOS ──
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.patch('/users/:id/status', userController.toggleUserStatus);
router.put('/users/:id/sedes', userController.updateUserSedes);
router.put('/users/:id/categories', userController.updateUserCategories);

// ── ROLES & PERMISOS ──
router.get('/roles', roleController.getRoles);
router.post('/roles', roleController.createRole);
router.put('/roles/:id', roleController.updateRole);
router.get('/permissions', roleController.getPermissions);

// ── UBICACIONES (SEDES, SECTORES, ÁREAS) ──
router.get('/sedes', locationController.getSedes);
router.post('/sedes', locationController.createSede);
router.put('/sedes/:id', locationController.updateSede);

router.get('/sectors', locationController.getSectors);
router.post('/sectors', locationController.createSector);
router.put('/sectors/:id', locationController.updateSector);

router.get('/areas', locationController.getAreas);
router.post('/areas', locationController.createArea);
router.put('/areas/:id', locationController.updateArea);

// ── CHECKLIST ──
router.get('/checklist-categories', checklistController.getCategories);
router.post('/checklist-categories', checklistController.createCategory);
router.put('/checklist-categories/:id', checklistController.updateCategory);

router.get('/checklist-config', checklistController.getConfig);
router.put('/checklist-config', checklistController.updateConfig);

router.get('/checklists', checklistController.getChecklists);
router.post('/checklists', checklistController.createChecklist);
router.put('/checklists/:id', checklistController.updateChecklist);
router.delete('/checklists/:id', checklistController.deleteChecklist);

router.get('/checklist-schedules', checklistController.getSchedules);
router.post('/checklist-schedules', checklistController.createSchedule);
router.put('/checklist-schedules/:id', checklistController.updateSchedule);
router.delete('/checklist-schedules/:id', checklistController.deleteSchedule);

router.get('/checklist-revisions', checklistController.getRevisions);
router.post('/checklist-revisions/sync-missing', checklistController.syncMissingRevisions);
router.get('/checklist-revisions/:id', checklistController.getRevisionById);
router.put('/checklist-revisions/:id', checklistController.updateRevision);
router.post('/checklist-revisions', checklistController.createRevision);
router.get('/checklist-dashboard/stats', checklistController.getDashboardStats);

// ── MISC ──
router.get('/versions', miscController.getVersions);
router.post('/versions', miscController.createVersion);
router.delete('/versions/:id', miscController.deleteVersion);

router.get('/automatic-reports', miscController.getAutomaticReports);
router.post('/automatic-reports', miscController.createAutomaticReport);
router.put('/automatic-reports/:id', miscController.updateAutomaticReport);
router.delete('/automatic-reports/:id', miscController.deleteAutomaticReport);

module.exports = router;
