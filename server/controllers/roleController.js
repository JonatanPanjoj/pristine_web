const { Role, Permission } = require('../models');

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    return res.json({ success: true, roles: roles.map(r => r.toJSON()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const newRole = new Role(req.body);
    await newRole.save();
    return res.status(201).json({ success: true, role: newRole.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const updated = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    return res.json({ success: true, role: updated.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ module: 1, name: 1 });
    return res.json({ success: true, permissions: permissions.map(p => p.toJSON()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  getPermissions,
};
