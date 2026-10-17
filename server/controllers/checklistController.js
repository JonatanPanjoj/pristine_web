const mongoose = require('mongoose');
const {
  CategoryChecklist,
  ChecklistConfig,
  Checklist,
  ChecklistSchedule,
  ChecklistRevision,
  Sede,
  Sector,
  Area,
} = require('../models');

// ── CATEGORÍAS ──
const formatCategory = (c) => {
  const json = c.toJSON ? c.toJSON() : { ...c };
  const id = json.id || json._id;
  const isEnabled = json.is_enabled !== false && json.status !== false;
  return {
    ...json,
    id,
    _id: id,
    is_enabled: isEnabled,
    status: isEnabled,
    users_id: json.users_id || [],
  };
};

const getCategories = async (req, res) => {
  try {
    const cats = await CategoryChecklist.find().sort({ name: 1 });
    return res.json({ success: true, categories: cats.map(formatCategory) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    const isEnabled = data.is_enabled !== undefined ? Boolean(data.is_enabled) : (data.status !== undefined ? Boolean(data.status) : true);
    data.status = isEnabled;
    data.is_enabled = isEnabled;
    const newCat = new CategoryChecklist(data);
    await newCat.save();
    return res.status(201).json({ success: true, category: formatCategory(newCat) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.is_enabled !== undefined || data.status !== undefined) {
      const isEnabled = data.is_enabled !== undefined ? Boolean(data.is_enabled) : Boolean(data.status);
      data.status = isEnabled;
      data.is_enabled = isEnabled;
    }
    const updated = await CategoryChecklist.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    return res.json({ success: true, category: formatCategory(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── CONFIGURACIÓN DE CHECKLIST ──
const getConfig = async (req, res) => {
  try {
    let config = await ChecklistConfig.findOne();
    if (!config) {
      config = new ChecklistConfig();
      await config.save();
    }
    return res.json({ success: true, config: config.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    let config = await ChecklistConfig.findOne();
    if (!config) {
      config = new ChecklistConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }
    await config.save();
    return res.json({ success: true, config: config.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PLANTILLAS / CHECKLISTS ──
const formatChecklist = (l) => {
  const json = l.toJSON ? l.toJSON() : { ...l };
  const id = json.id || json._id;
  const catId = json.categoryId || json.category_id || '';
  const isEnabled = json.isEnabled !== false && json.status !== false;
  const createdAt = json.createdAt || json.created_at || (json._id ? new Date(parseInt(json._id.toString().substring(0, 8), 16) * 1000).toISOString() : new Date().toISOString());
  const updatedAt = json.updatedAt || json.updated_at || createdAt;
  return {
    ...json,
    id,
    _id: id,
    categoryId: catId,
    category_id: catId,
    isEnabled,
    status: isEnabled,
    questions: json.questions || json.items || [],
    createdAt,
    updatedAt,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const getChecklists = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { $or: [{ category_id: categoryId }, { categoryId }] } : {};
    const lists = await Checklist.find(filter).sort({ name: 1 });
    return res.json({ success: true, checklists: lists.map(formatChecklist) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createChecklist = async (req, res) => {
  try {
    const data = { ...req.body };
    const catId = data.categoryId || data.category_id || '';
    data.categoryId = catId;
    data.category_id = catId;
    const isEnabled = data.isEnabled !== false && data.status !== false;
    data.isEnabled = isEnabled;
    data.status = isEnabled;
    if (data.questions && !data.items) data.items = data.questions;
    if (data.items && !data.questions) data.questions = data.items;

    const newChecklist = new Checklist(data);
    await newChecklist.save();
    return res.status(201).json({ success: true, checklist: formatChecklist(newChecklist) });
  } catch (error) {
    console.error('Error al crear checklist:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateChecklist = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.categoryId || data.category_id) {
      const catId = data.categoryId || data.category_id;
      data.categoryId = catId;
      data.category_id = catId;
    }
    if (data.isEnabled !== undefined || data.status !== undefined) {
      const isEnabled = data.isEnabled !== false && data.status !== false;
      data.isEnabled = isEnabled;
      data.status = isEnabled;
    }
    if (data.questions && !data.items) data.items = data.questions;
    if (data.items && !data.questions) data.questions = data.items;

    const updated = await Checklist.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Checklist no encontrado' });
    return res.json({ success: true, checklist: formatChecklist(updated) });
  } catch (error) {
    console.error('Error al actualizar checklist:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteChecklist = async (req, res) => {
  try {
    const deleted = await Checklist.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Checklist no encontrado' });
    return res.json({ success: true, message: 'Checklist eliminado' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PROGRAMACIONES (SCHEDULES) ──
const defaultActiveDays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

const formatSchedule = (s) => {
  const json = s.toJSON ? s.toJSON() : { ...s };
  const id = json.id || json._id;
  const checklistId = json.checklistId || json.checklist_id || '';
  const sedeId = json.sedeId || json.sede_id || '';
  const sectorId = json.sectorId || json.sector_id || '';
  const areaId = json.areaId !== undefined ? json.areaId : (json.area_id !== undefined ? json.area_id : 0);
  const checklistName = json.checklistName || json.checklist_name || '';
  const isEnabled = json.isEnabled !== undefined ? Boolean(json.isEnabled) : (json.status !== 'inactive' && json.status !== false);

  const activeDays = {
    ...defaultActiveDays,
    ...(json.activeDays || {}),
  };

  return {
    ...json,
    id,
    _id: id,
    checklistId,
    checklist_id: checklistId,
    checklistName,
    checklist_name: checklistName,
    sedeId,
    sede_id: sedeId,
    sectorId,
    sector_id: sectorId,
    areaId,
    area_id: areaId,
    startTime: json.startTime || '08:00',
    endTime: json.endTime || '17:00',
    activeDays,
    isEnabled,
    status: isEnabled ? 'active' : 'inactive',
    observations: json.observations || '',
  };
};

const getSchedules = async (req, res) => {
  try {
    const { sedeId, sectorId, areaId, userId, checklistId } = req.query;
    const conditions = [];
    if (sedeId) conditions.push({ $or: [{ sede_id: sedeId }, { sedeId }] });
    if (sectorId) conditions.push({ $or: [{ sector_id: sectorId }, { sectorId }] });
    if (areaId) conditions.push({ $or: [{ area_id: areaId }, { areaId }] });
    if (userId) conditions.push({ $or: [{ user_id: userId }, { userId }] });
    if (checklistId) conditions.push({ $or: [{ checklist_id: checklistId }, { checklistId }] });

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const schedules = await ChecklistSchedule.find(filter).sort({ created_at: -1 });
    return res.json({ success: true, schedules: schedules.map(formatSchedule) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const data = { ...req.body };
    const chkId = data.checklistId || data.checklist_id || '';
    data.checklistId = chkId;
    data.checklist_id = chkId;
    const sId = data.sedeId || data.sede_id || '';
    data.sedeId = sId;
    data.sede_id = sId;
    const secId = data.sectorId || data.sector_id || '';
    data.sectorId = secId;
    data.sector_id = secId;
    const aId = data.areaId !== undefined ? data.areaId : data.area_id;
    data.areaId = aId;
    data.area_id = aId;
    const chkName = data.checklistName || data.checklist_name || '';
    data.checklistName = chkName;
    data.checklist_name = chkName;

    if (data.activeDays) {
      data.activeDays = { ...defaultActiveDays, ...data.activeDays };
    } else {
      data.activeDays = { ...defaultActiveDays };
    }

    const isEnabled = data.isEnabled !== undefined ? Boolean(data.isEnabled) : (data.status !== 'inactive' && data.status !== false);
    data.isEnabled = isEnabled;
    data.status = isEnabled ? 'active' : 'inactive';

    const newSchedule = new ChecklistSchedule(data);
    await newSchedule.save();
    return res.status(201).json({ success: true, schedule: formatSchedule(newSchedule) });
  } catch (error) {
    console.error('Error al crear programación:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.checklistId || data.checklist_id) {
      const chkId = data.checklistId || data.checklist_id;
      data.checklistId = chkId;
      data.checklist_id = chkId;
    }
    if (data.sedeId || data.sede_id) {
      const sId = data.sedeId || data.sede_id;
      data.sedeId = sId;
      data.sede_id = sId;
    }
    if (data.sectorId || data.sector_id) {
      const secId = data.sectorId || data.sector_id;
      data.sectorId = secId;
      data.sector_id = secId;
    }
    if (data.areaId !== undefined || data.area_id !== undefined) {
      const aId = data.areaId !== undefined ? data.areaId : data.area_id;
      data.areaId = aId;
      data.area_id = aId;
    }
    if (data.isEnabled !== undefined || data.status !== undefined) {
      const isEnabled = data.isEnabled !== undefined ? Boolean(data.isEnabled) : (data.status !== 'inactive' && data.status !== false);
      data.isEnabled = isEnabled;
      data.status = isEnabled ? 'active' : 'inactive';
    }
    if (data.activeDays) {
      data.activeDays = { ...defaultActiveDays, ...data.activeDays };
    }

    const updated = await ChecklistSchedule.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Programación no encontrada' });
    return res.json({ success: true, schedule: formatSchedule(updated) });
  } catch (error) {
    console.error('Error al actualizar programación:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const deleted = await ChecklistSchedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Programación no encontrada' });
    return res.json({ success: true, message: 'Programación eliminada' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── REVISIONES Y RESULTADOS ──
const findRevisionByIdOrCode = async (idOrCode) => {
  if (!idOrCode) return null;
  const strId = String(idOrCode).trim();
  let rev = await ChecklistRevision.findOne({
    $or: [{ custom_id: strId }, { code: strId }]
  });
  if (!rev && mongoose.isValidObjectId(strId)) {
    rev = await ChecklistRevision.findById(strId);
  }
  return rev;
};

const getRevisions = async (req, res) => {
  try {
    const { sedeId, sectorId, areaId, userId, categoryId, checklistId, startDate, endDate, limit = 500 } = req.query;
    const conditions = [];

    if (sedeId) {
      conditions.push({ $or: [{ sede_id: sedeId }, { sedeId: sedeId }, { 'location.sedeId': sedeId }] });
    }
    if (sectorId) {
      conditions.push({ $or: [{ sector_id: sectorId }, { sectorId: sectorId }, { 'location.sectorId': sectorId }] });
    }
    if (areaId) {
      conditions.push({
        $or: [
          { area_id: areaId },
          { areaId: areaId },
          { 'location.areaId': areaId },
          { area_id: Number(areaId) || 0 },
          { 'location.areaId': Number(areaId) || 0 },
        ]
      });
    }
    if (userId) {
      conditions.push({ $or: [{ user_id: userId }, { userId: userId }, { 'user.id': userId }] });
    }
    if (categoryId) {
      conditions.push({ $or: [{ category_id: categoryId }, { categoryId: categoryId }, { 'checklist.categoryId': categoryId }] });
    }
    if (checklistId) {
      conditions.push({ $or: [{ checklist_id: checklistId }, { checklistId: checklistId }, { 'checklist.id': checklistId }] });
    }

    if (startDate || endDate) {
      let start = startDate ? new Date(startDate) : new Date(0);
      let end = endDate ? new Date(endDate) : new Date('2099-12-31');

      if (typeof endDate === 'string' && endDate.length <= 10) {
        end = new Date(endDate + 'T23:59:59.999Z');
      } else if (endDate) {
        end = new Date(endDate);
        if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
          end.setHours(23, 59, 59, 999);
        }
      }

      const startISO = start.toISOString();
      const endISO = end.toISOString();
      const startDateStr = startISO.slice(0, 10);
      const endDateStr = endISO.slice(0, 10);

      conditions.push({
        $or: [
          { revision_date: { $gte: start, $lte: end } },
          { created_at: { $gte: start, $lte: end } },
          { startDate: { $gte: startISO, $lte: endISO } },
          { startDate: { $gte: startDateStr, $lte: endDateStr + 'T23:59:59' } },
        ]
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const revisions = await ChecklistRevision.find(filter)
      .sort({ created_at: -1, revision_date: -1 })
      .limit(parseInt(limit));

    return res.json({
      success: true,
      revisions: revisions.map(r => {
        const json = r.toJSON ? r.toJSON() : { ...r };
        const id = json.custom_id || json.code || json.id || json._id;
        return {
          ...json,
          id,
          _id: json._id || id,
        };
      })
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getRevisionById = async (req, res) => {
  try {
    const revision = await findRevisionByIdOrCode(req.params.id);
    if (!revision) return res.status(404).json({ success: false, message: 'Revisión no encontrada' });
    return res.json({ success: true, revision: revision.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createRevision = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.custom_id && !data.correlativo) {
      const lastRev = await ChecklistRevision.findOne({
        $or: [
          { correlativo: { $exists: true, $ne: null } },
          { custom_id: { $regex: /^REV-\d+$/ } }
        ]
      }).sort({ correlativo: -1, created_at: -1 });

      let nextCorrelativo = 1000;
      if (lastRev) {
        let num = lastRev.correlativo || lastRev.numeroRevision || 0;
        if (!num && lastRev.custom_id && lastRev.custom_id.startsWith('REV-')) {
          const parsed = parseInt(lastRev.custom_id.replace('REV-', ''), 10);
          if (!isNaN(parsed)) num = parsed;
        }
        if (num >= 1000) nextCorrelativo = num + 1;
      }
      data.correlativo = nextCorrelativo;
      data.numeroRevision = nextCorrelativo;
      data.custom_id = `REV-${nextCorrelativo}`;
      data.code = `REV-${nextCorrelativo}`;
    }

    const newRevision = new ChecklistRevision(data);
    await newRevision.save();
    return res.status(201).json({ success: true, revision: newRevision.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateRevision = async (req, res) => {
  try {
    const rev = await findRevisionByIdOrCode(req.params.id);
    if (!rev) return res.status(404).json({ success: false, message: 'Revisión no encontrada' });

    const data = { ...req.body };
    if (data.photoUrl) {
      data.PhotoUrl = data.photoUrl;
      data.photos = [data.photoUrl];
    }
    if (data.status) rev.status = data.status;
    if (data.answers) rev.answers = data.answers;
    if (data.observations !== undefined) {
      rev.observations = data.observations;
      rev.comments = data.observations;
    }
    if (data.signatureUrl !== undefined) rev.signatureUrl = data.signatureUrl;
    if (data.PhotoUrl !== undefined) rev.PhotoUrl = data.PhotoUrl;
    if (data.supervisor !== undefined) rev.supervisor = data.supervisor;
    if (data.endDate !== undefined) rev.endDate = data.endDate;

    Object.assign(rev, data);
    await rev.save();
    return res.json({ success: true, revision: rev.toJSON() });
  } catch (error) {
    console.error('Error al actualizar revisión:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const syncMissingRevisions = async (req, res) => {
  try {
    const now = new Date();
    const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const localDayName = DAY_KEYS[now.getDay()];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayDateStr = `${year}-${month}-${day}`;

    // 1. Programaciones habilitadas
    const enabledSchedules = await ChecklistSchedule.find({
      $or: [{ isEnabled: true }, { status: 'active' }]
    });

    if (enabledSchedules.length === 0) {
      return res.json({ success: true, syncedCount: 0 });
    }

    // 2. Filtrar solo programaciones activas en el día de hoy
    const todaysSchedules = enabledSchedules.filter((sch) => {
      const activeDays = sch.activeDays || {};
      return activeDays[localDayName] === true;
    });

    if (todaysSchedules.length === 0) {
      return res.json({ success: true, syncedCount: 0 });
    }

    // 3. Cargar catálogos
    const [sedes, sectors, areas, checklists, categories] = await Promise.all([
      Sede.find(),
      Sector.find(),
      Area.find(),
      Checklist.find(),
      CategoryChecklist.find(),
    ]);

    const sedeMap = {};
    sedes.forEach(s => { sedeMap[s.id || s._id] = s.name; if (s.sede_id) sedeMap[s.sede_id] = s.name; });

    const sectorMap = {};
    sectors.forEach(s => { sectorMap[s.id || s._id] = s.name; if (s.sector_id) sectorMap[s.sector_id] = s.name; });

    const areaMap = {};
    areas.forEach(a => { const aId = Number(a.area_id ?? a.areaId); if (!isNaN(aId)) areaMap[aId] = a.name; });

    const checklistMap = {};
    checklists.forEach(c => { checklistMap[c.id || c._id] = c; });

    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.id || c._id] = c.name; });

    // 4. Último correlativo
    const lastRev = await ChecklistRevision.findOne({
      $or: [
        { correlativo: { $exists: true, $ne: null } },
        { custom_id: { $regex: /^REV-\d+$/ } }
      ]
    }).sort({ correlativo: -1, created_at: -1 });

    let currentCorrelativo = 1000;
    if (lastRev) {
      let num = lastRev.correlativo || lastRev.numeroRevision || 0;
      if (!num && lastRev.custom_id && lastRev.custom_id.startsWith('REV-')) {
        const parsed = parseInt(lastRev.custom_id.replace('REV-', ''), 10);
        if (!isNaN(parsed)) num = parsed;
      }
      if (num >= 1000) currentCorrelativo = num + 1;
    }

    let syncedCount = 0;

    for (const sch of todaysSchedules) {
      const schId = sch.id || sch._id.toString();
      const existingRevs = await ChecklistRevision.find({
        $or: [{ schedule_id: schId }, { scheduleId: schId }]
      });

      const alreadyCreatedToday = existingRevs.some((rev) => {
        const date = rev.created_at || rev.revision_date || (rev.startDate ? new Date(rev.startDate) : null);
        if (!date) return false;
        const d = new Date(date);
        const cYear = d.getFullYear();
        const cMonth = String(d.getMonth() + 1).padStart(2, "0");
        const cDay = String(d.getDate()).padStart(2, "0");
        return `${cYear}-${cMonth}-${cDay}` === todayDateStr;
      });

      if (alreadyCreatedToday) continue;

      const nextCorrelativo = currentCorrelativo++;
      const revisionId = `REV-${nextCorrelativo}`;
      const chk = checklistMap[sch.checklistId || sch.checklist_id] || {};
      const categoryId = chk.category_id || chk.categoryId || '';
      const categoryName = categoryMap[categoryId] || chk.categoryName || 'Inspección';

      const answers = (chk.questions || [])
        .filter(q => q.isEnabled !== false)
        .map(q => ({
          questionId: q.id || q._id,
          questionText: q.questionText || q.text || '',
          value: 'na',
          photoUrl: null,
          observations: '',
        }));

      const startTime24h = sch.startTime || '08:00:00';
      const endTime24h = sch.endTime || '17:00:00';
      const sId = sch.sedeId || sch.sede_id || '';
      const secId = sch.sectorId || sch.sector_id || '';
      const aId = Number(sch.areaId ?? sch.area_id) || 0;
      const sedeName = sch.sedeName || sedeMap[sId] || '';
      const sectorName = sch.sectorName || sectorMap[secId] || '';
      const areaName = sch.areaName || areaMap[aId] || (aId ? `Área ${aId}` : '');

      const newRev = new ChecklistRevision({
        custom_id: revisionId,
        correlativo: nextCorrelativo,
        numeroRevision: nextCorrelativo,
        code: revisionId,
        sequentialId: nextCorrelativo,
        schedule_id: schId,
        scheduleId: schId,
        checklist_id: chk.id || chk._id || sch.checklistId || sch.checklist_id,
        checklistId: chk.id || chk._id || sch.checklistId || sch.checklist_id,
        checklist_name: chk.name || sch.checklistName || 'Checklist General',
        checklist: {
          id: chk.id || chk._id || sch.checklistId || sch.checklist_id,
          name: chk.name || sch.checklistName || 'Checklist General',
          categoryId,
          categoryName,
        },
        location: {
          sedeId: sId,
          sedeName,
          sectorId: secId,
          sectorName,
          areaId: aId,
          areaName,
        },
        sede_id: sId,
        sector_id: secId,
        area_id: aId,
        scheduleSnapshot: {
          startTime: startTime24h,
          endTime: endTime24h,
          activeDay: localDayName,
        },
        user: { id: '', name: '' },
        user_id: '',
        user_name: '',
        status: 'pending',
        startDate: `${todayDateStr}T${startTime24h}`,
        endDate: null,
        durationSeconds: null,
        observations: '',
        signatureUrl: null,
        PhotoUrl: null,
        supervisor: null,
        answers,
        revision_date: now,
      });

      await newRev.save();
      syncedCount++;
    }

    return res.json({ success: true, syncedCount });
  } catch (error) {
    console.error('Error al sincronizar revisiones:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DASHBOARD STATS (Métricas dinámicas dependientes de filtros y revisiones) ──
const getDashboardStats = async (req, res) => {
  try {
    const { sedeId, sectorId, areaId, categoryId, statusId, startDate, endDate } = req.query;

    // 1. Condiciones para Revisiones
    const revisionConditions = [];
    if (sedeId) {
      revisionConditions.push({ $or: [{ sede_id: sedeId }, { sedeId: sedeId }, { 'location.sedeId': sedeId }] });
    }
    if (sectorId) {
      revisionConditions.push({ $or: [{ sector_id: sectorId }, { sectorId: sectorId }, { 'location.sectorId': sectorId }] });
    }
    if (areaId) {
      const numAreaId = Number(areaId);
      revisionConditions.push({
        $or: [
          { area_id: areaId },
          { areaId: areaId },
          { 'location.areaId': areaId },
          ...(!isNaN(numAreaId) ? [{ area_id: numAreaId }, { 'location.areaId': numAreaId }] : [])
        ]
      });
    }
    if (categoryId) {
      revisionConditions.push({
        $or: [
          { category_id: categoryId },
          { categoryId: categoryId },
          { 'checklist.categoryId': categoryId },
          { 'checklist.category_id': categoryId }
        ]
      });
    }
    if (statusId) {
      if (statusId === 'expired' || statusId === 'overdue') {
        revisionConditions.push({ $or: [{ status: 'expired' }, { status: 'overdue' }] });
      } else {
        revisionConditions.push({ status: statusId });
      }
    }
    if (startDate || endDate) {
      let start = startDate ? new Date(startDate) : new Date(0);
      let end = endDate ? new Date(endDate) : new Date('2099-12-31');

      if (typeof endDate === 'string' && endDate.length <= 10) {
        end = new Date(endDate + 'T23:59:59.999Z');
      } else if (endDate) {
        end = new Date(endDate);
        if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
          end.setHours(23, 59, 59, 999);
        }
      }

      const startISO = start.toISOString();
      const endISO = end.toISOString();
      const startDateStr = startISO.slice(0, 10);
      const endDateStr = endISO.slice(0, 10);

      revisionConditions.push({
        $or: [
          { revision_date: { $gte: start, $lte: end } },
          { created_at: { $gte: start, $lte: end } },
          { startDate: { $gte: startISO, $lte: endISO } },
          { startDate: { $gte: startDateStr, $lte: endDateStr + 'T23:59:59' } },
        ]
      });
    }

    const revisionFilter = revisionConditions.length > 0 ? { $and: revisionConditions } : {};

    // 2. Condiciones para Programaciones (Schedules)
    const scheduleConditions = [];
    if (sedeId) {
      scheduleConditions.push({ $or: [{ sede_id: sedeId }, { sedeId: sedeId }] });
    }
    if (sectorId) {
      scheduleConditions.push({ $or: [{ sector_id: sectorId }, { sectorId: sectorId }] });
    }
    if (areaId) {
      const numAreaId = Number(areaId);
      scheduleConditions.push({
        $or: [
          { area_id: areaId },
          { areaId: areaId },
          ...(!isNaN(numAreaId) ? [{ area_id: numAreaId }, { areaId: numAreaId }] : [])
        ]
      });
    }
    if (categoryId) {
      const matchingChecklists = await Checklist.find({
        $or: [{ categoryId }, { category_id: categoryId }]
      }).select('_id');
      const chkIds = matchingChecklists.map(c => c._id.toString());
      scheduleConditions.push({
        $or: [
          { checklistId: { $in: chkIds } },
          { checklist_id: { $in: chkIds } }
        ]
      });
    }
    const scheduleFilter = scheduleConditions.length > 0 ? { $and: scheduleConditions } : {};

    // 3. Ejecutar consultas
    const [matchingRevisions, matchingSchedules, allSedes, allAreas] = await Promise.all([
      ChecklistRevision.find(revisionFilter).lean(),
      ChecklistSchedule.find(scheduleFilter).lean(),
      Sede.find().lean(),
      Area.find().lean(),
    ]);

    // 4. Conteo de Estados
    const totalRevisions = matchingRevisions.length;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let overdue = 0;

    matchingRevisions.forEach((rev) => {
      const st = String(rev.status || '').toLowerCase();
      if (st === 'completed') completed++;
      else if (st === 'in_progress') inProgress++;
      else if (st === 'overdue' || st === 'expired') overdue++;
      else pending++;
    });

    const totalScheduled = matchingSchedules.length;
    const scheduledToday = totalScheduled > 0 ? totalScheduled : (totalRevisions > 0 ? totalRevisions : 0);
    const executedToday = completed;

    // Cumplimiento global
    let compliancePct = 100;
    if (totalRevisions > 0) {
      compliancePct = Math.round((completed / totalRevisions) * 100);
    } else if (scheduledToday > 0) {
      compliancePct = 0;
    }

    const coveragePct = scheduledToday > 0 ? Math.min(100, Math.round(((completed + inProgress) / scheduledToday) * 100)) : 100;

    // Etiqueta de periodo
    let periodLabel = 'General';
    if (startDate && endDate) {
      periodLabel = startDate === endDate ? startDate : `${startDate} a ${endDate}`;
    } else if (startDate) {
      periodLabel = `Desde ${startDate}`;
    } else if (endDate) {
      periodLabel = `Hasta ${endDate}`;
    } else {
      periodLabel = 'Últimos 30 días';
    }

    // 5. Cumplimiento por Sede (locationCompliance / bySede)
    const sedeMap = new Map();
    allSedes.forEach(s => {
      const id = s.id || s._id.toString();
      sedeMap.set(id, { name: s.name, completed: 0, total: 0 });
    });

    matchingRevisions.forEach(rev => {
      const sId = String(rev.location?.sedeId || rev.sede_id || rev.sedeId || '');
      let sEntry = sedeMap.get(sId);
      if (!sEntry) {
        const sName = rev.location?.sedeName || 'Sede';
        sEntry = { name: sName, completed: 0, total: 0 };
        sedeMap.set(sId, sEntry);
      }
      sEntry.total++;
      if (String(rev.status || '').toLowerCase() === 'completed') {
        sEntry.completed++;
      }
    });

    let locationCompliance = [];
    if (sedeId) {
      const single = sedeMap.get(String(sedeId));
      if (single) {
        const val = single.total > 0 ? Math.round((single.completed / single.total) * 100) : 100;
        locationCompliance.push({ name: single.name, value: val });
      }
    } else {
      const byNameMap = new Map();
      Array.from(sedeMap.values()).forEach(s => {
        const cur = byNameMap.get(s.name) || { completed: 0, total: 0 };
        cur.completed += s.completed;
        cur.total += s.total;
        byNameMap.set(s.name, cur);
      });
      locationCompliance = Array.from(byNameMap.entries())
        .filter(([_, s]) => s.total > 0)
        .map(([name, s]) => ({
          name,
          value: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 100
        }));
    }

    if (locationCompliance.length === 0) {
      const uniqueNames = Array.from(new Set(allSedes.map(s => s.name))).slice(0, 5);
      locationCompliance = uniqueNames.map(name => ({ name, value: 100 }));
    }

    // 6. Estado de Revisiones (Donut)
    const statusData = [
      { name: 'Completadas', value: completed, color: '#10B981' },
      { name: 'En Proceso', value: inProgress, color: '#389CD6' },
      { name: 'Atrasadas', value: overdue, color: '#EF4444' },
      { name: 'Pendientes', value: pending, color: '#F59E0B' },
    ];

    // 7. Tendencia de Cumplimiento
    const dayStatsMap = new Map();
    matchingRevisions.forEach(rev => {
      const rawDate = rev.startDate || rev.created_at || rev.revision_date;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isComp = String(rev.status || '').toLowerCase() === 'completed';
      const cur = dayStatsMap.get(dateStr) || { completed: 0, total: 0, date: d };
      cur.total++;
      if (isComp) cur.completed++;
      dayStatsMap.set(dateStr, cur);
    });

    let trendData = [];
    if (dayStatsMap.size > 0) {
      const sortedDates = Array.from(dayStatsMap.keys()).sort();
      trendData = sortedDates.slice(-14).map(dateStr => {
        const item = dayStatsMap.get(dateStr);
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dayLabel = `${dayNames[item.date.getDay()]} ${item.date.getDate()}`;
        return {
          name: dayLabel,
          value: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 100,
        };
      });
    }

    if (trendData.length === 0) {
      const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
      trendData = dayNames.map((d) => ({
        name: d,
        value: compliancePct > 0 ? compliancePct : 100
      }));
    }

    // 8. Mapa de Calor (Área vs Hora) y Áreas Críticas
    const areaStatsMap = new Map();
    allAreas.forEach(a => {
      const id = a.id || a._id.toString();
      areaStatsMap.set(id, {
        name: a.name,
        completed: 0,
        total: 0,
        hours: { '06:00': { c: 0, t: 0 }, '12:00': { c: 0, t: 0 }, '18:00': { c: 0, t: 0 }, '22:00': { c: 0, t: 0 } }
      });
    });

    matchingRevisions.forEach(rev => {
      const aId = String(rev.location?.areaId ?? rev.area_id ?? rev.areaId ?? '');
      let aEntry = areaStatsMap.get(aId);
      if (!aEntry) {
        const aName = rev.location?.areaName || (aId ? `Área ${aId}` : 'Área General');
        aEntry = {
          name: aName,
          completed: 0,
          total: 0,
          hours: { '06:00': { c: 0, t: 0 }, '12:00': { c: 0, t: 0 }, '18:00': { c: 0, t: 0 }, '22:00': { c: 0, t: 0 } }
        };
        areaStatsMap.set(aId, aEntry);
      }

      aEntry.total++;
      const isComp = String(rev.status || '').toLowerCase() === 'completed';
      if (isComp) aEntry.completed++;

      // Determinar hora
      let hourNum = 12;
      const timeStr = rev.scheduleSnapshot?.startTime || rev.startDate;
      if (timeStr) {
        const timeMatch = String(timeStr).match(/(\d{1,2}):\d{2}/);
        if (timeMatch) hourNum = parseInt(timeMatch[1], 10);
      }

      let slot = '12:00';
      if (hourNum >= 6 && hourNum < 12) slot = '06:00';
      else if (hourNum >= 12 && hourNum < 18) slot = '12:00';
      else if (hourNum >= 18 && hourNum < 22) slot = '18:00';
      else slot = '22:00';

      aEntry.hours[slot].t++;
      if (isComp) aEntry.hours[slot].c++;
    });

    const activeAreas = Array.from(areaStatsMap.values()).filter(a => a.total > 0);
    const targetAreas = activeAreas.length > 0 ? activeAreas : Array.from(areaStatsMap.values()).slice(0, 4);

    const heatmapData = targetAreas.slice(0, 5).map(a => {
      const calcSlot = (slotKey) => {
        const h = a.hours[slotKey];
        if (h && h.t > 0) return Math.round((h.c / h.t) * 100);
        return a.total > 0 ? Math.round((a.completed / a.total) * 100) : 100;
      };
      return {
        area: a.name,
        '06:00': calcSlot('06:00'),
        '12:00': calcSlot('12:00'),
        '18:00': calcSlot('18:00'),
        '22:00': calcSlot('22:00'),
      };
    });

    // 9. Ranking de Áreas Críticas (Menor cumplimiento)
    const worstAreas = targetAreas
      .map(a => ({
        name: a.name,
        value: a.total > 0 ? Math.round((a.completed / a.total) * 100) : 100
      }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 5);

    const worstAreaName = worstAreas.length > 0 ? worstAreas[0].name : 'Sin incidencias';
    const worstAreaPct = worstAreas.length > 0 ? worstAreas[0].value : 100;

    return res.json({
      success: true,
      stats: {
        totalRevisions,
        completed,
        inProgress,
        pending,
        overdueCount: overdue,
        inProgressCount: inProgress,
        scheduledToday,
        executedToday,
        compliancePct,
        coveragePct,
        periodLabel,
        worstAreaName,
        worstAreaPct,
        locationCompliance,
        bySede: locationCompliance,
        statusData,
        byStatus: statusData,
        trendData,
        trend: trendData,
        heatmapData,
        heatmap: heatmapData,
        worstAreas,
        lastUpdatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  getConfig,
  updateConfig,
  getChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getRevisions,
  getRevisionById,
  createRevision,
  updateRevision,
  syncMissingRevisions,
  getDashboardStats,
};
