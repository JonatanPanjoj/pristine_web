const { Sede, Sector, Area } = require('../models');

// ── SEDES ──
const getSedes = async (req, res) => {
  try {
    const sedes = await Sede.find().sort({ name: 1 });
    return res.json({ success: true, sedes: sedes.map(s => s.toJSON()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSede = async (req, res) => {
  try {
    const newSede = new Sede(req.body);
    await newSede.save();
    return res.status(201).json({ success: true, sede: newSede.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSede = async (req, res) => {
  try {
    const updated = await Sede.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Sede no encontrada' });
    return res.json({ success: true, sede: updated.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── SECTORES ──
const getSectors = async (req, res) => {
  try {
    const { sedeId, search } = req.query;
    const filter = {};
    if (sedeId) {
      filter.$or = [{ sede_id: sedeId }, { SedeId: sedeId }];
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const sectors = await Sector.find(filter).sort({ name: 1 });
    return res.json({
      success: true,
      sectors: sectors.map(s => {
        const json = s.toJSON();
        json.SedeId = json.SedeId || json.sede_id;
        json.sede_id = json.sede_id || json.SedeId;
        json.is_enabled = json.is_enabled !== false && json.status !== false;
        return json;
      })
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSector = async (req, res) => {
  try {
    const data = { ...req.body };
    const sedeId = data.SedeId || data.sede_id;
    data.sede_id = sedeId;
    data.SedeId = sedeId;
    data.status = data.status ?? data.is_enabled ?? true;
    data.is_enabled = data.is_enabled ?? data.status ?? true;

    const newSector = new Sector(data);
    await newSector.save();
    const json = newSector.toJSON();
    json.SedeId = json.SedeId || json.sede_id;
    json.sede_id = json.sede_id || json.SedeId;
    json.is_enabled = json.is_enabled !== false && json.status !== false;
    return res.status(201).json({ success: true, sector: json });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSector = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.SedeId || data.sede_id) {
      const sedeId = data.SedeId || data.sede_id;
      data.sede_id = sedeId;
      data.SedeId = sedeId;
    }
    if (data.is_enabled !== undefined && data.status === undefined) {
      data.status = data.is_enabled;
    }
    const updated = await Sector.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Sector no encontrado' });
    const json = updated.toJSON();
    json.SedeId = json.SedeId || json.sede_id;
    json.sede_id = json.sede_id || json.SedeId;
    json.is_enabled = json.is_enabled !== false && json.status !== false;
    return res.json({ success: true, sector: json });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── ÁREAS ──
const formatArea = (a) => {
  const json = a.toJSON ? a.toJSON() : { ...a };
  const id = json.id || json._id;
  const sedeId = json.SedeId || json.sede_id;
  const sectorId = json.SectorId || json.sector_id;
  const isEnabled = json.is_enabled !== false && json.status !== false;

  return {
    ...json,
    id,
    _id: id,
    sede_id: sedeId,
    SedeId: sedeId,
    sector_id: sectorId,
    SectorId: sectorId,
    is_enabled: isEnabled,
    status: isEnabled,
    area_id: json.area_id ?? ''
  };
};

const getAreas = async (req, res) => {
  try {
    const { sectorId, sedeId } = req.query;
    const conditions = [];
    if (sectorId) {
      conditions.push({ $or: [{ sector_id: sectorId }, { SectorId: sectorId }] });
    }
    if (sedeId) {
      conditions.push({ $or: [{ sede_id: sedeId }, { SedeId: sedeId }] });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const areas = await Area.find(filter).sort({ name: 1 });
    return res.json({ success: true, areas: areas.map(formatArea) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createArea = async (req, res) => {
  try {
    const data = { ...req.body };
    const sedeId = data.SedeId || data.sede_id || '';
    const sectorId = data.SectorId || data.sector_id || '';
    data.sede_id = sedeId;
    data.SedeId = sedeId;
    data.sector_id = sectorId;
    data.SectorId = sectorId;

    if (!data.area_id || isNaN(Number(data.area_id))) {
      const count = await Area.countDocuments();
      data.area_id = count + 101;
    } else {
      data.area_id = Number(data.area_id);
    }

    const isEnabled = data.is_enabled !== undefined ? Boolean(data.is_enabled) : (data.status !== undefined ? Boolean(data.status) : true);
    data.is_enabled = isEnabled;
    data.status = isEnabled;

    const newArea = new Area(data);
    await newArea.save();
    return res.status(201).json({ success: true, area: formatArea(newArea) });
  } catch (error) {
    console.error('Error al crear área:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateArea = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.SedeId || data.sede_id) {
      const sedeId = data.SedeId || data.sede_id;
      data.sede_id = sedeId;
      data.SedeId = sedeId;
    }
    if (data.SectorId || data.sector_id) {
      const sectorId = data.SectorId || data.sector_id;
      data.sector_id = sectorId;
      data.SectorId = sectorId;
    }
    if (data.is_enabled !== undefined || data.status !== undefined) {
      const isEnabled = data.is_enabled !== undefined ? Boolean(data.is_enabled) : Boolean(data.status);
      data.is_enabled = isEnabled;
      data.status = isEnabled;
    }
    if (data.area_id !== undefined && data.area_id !== '') {
      if (!isNaN(Number(data.area_id))) {
        data.area_id = Number(data.area_id);
      }
    } else if (data.area_id === '') {
      delete data.area_id;
    }

    const updated = await Area.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Área no encontrada' });
    return res.json({ success: true, area: formatArea(updated) });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSedes,
  createSede,
  updateSede,
  getSectors,
  createSector,
  updateSector,
  getAreas,
  createArea,
  updateArea,
};
