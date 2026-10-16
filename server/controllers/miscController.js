const { AppVersion, AutomaticReport } = require('../models');

// Versiones
const getVersions = async (req, res) => {
  try {
    const versions = await AppVersion.find().sort({ release_date: -1 });
    return res.json({ success: true, versions: versions.map(v => v.toJSON()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createVersion = async (req, res) => {
  try {
    const newVersion = new AppVersion(req.body);
    await newVersion.save();
    return res.status(201).json({ success: true, version: newVersion.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVersion = async (req, res) => {
  try {
    await AppVersion.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Versión eliminada' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reportes automáticos
const getAutomaticReports = async (req, res) => {
  try {
    const reports = await AutomaticReport.find().sort({ name: 1 });
    return res.json({ success: true, reports: reports.map(r => r.toJSON()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAutomaticReport = async (req, res) => {
  try {
    const newReport = new AutomaticReport(req.body);
    await newReport.save();
    return res.status(201).json({ success: true, report: newReport.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAutomaticReport = async (req, res) => {
  try {
    const updated = await AutomaticReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    return res.json({ success: true, report: updated.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAutomaticReport = async (req, res) => {
  try {
    await AutomaticReport.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Reporte eliminado' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVersions,
  createVersion,
  deleteVersion,
  getAutomaticReports,
  createAutomaticReport,
  updateAutomaticReport,
  deleteAutomaticReport,
};
