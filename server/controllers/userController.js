const { User, Sede } = require('../models');

// Generador de tokens de búsqueda
const generateSearchTokens = (name = '', username = '', email = '', phone = '') => {
  const tokens = new Set();
  const rawString = `${name} ${username} ${email} ${phone}`;
  const words = rawString.toLowerCase().split(/[\s@.\-_]+/);
  words.forEach(word => {
    if (word) {
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    }
  });
  return Array.from(tokens);
};

const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { user: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    if (role) {
      query.rol = role;
    }

    if (status !== undefined) {
      query.status = status === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      users: users.map(u => u.toJSON())
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    return res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const normalizeDate = (val) => {
  if (!val) return undefined;
  if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
  if (typeof val === 'object' && (val.seconds !== undefined || val._seconds !== undefined)) {
    const sec = val.seconds ?? val._seconds;
    const d = new Date(sec * 1000);
    return isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};

const createUser = async (req, res) => {
  try {
    const data = { ...req.body };

    // Eliminar id vacío para que Mongo asigne _id
    if (!data.id) delete data.id;

    // Normalizar created_at si viene de Firestore Timestamp { seconds, nanoseconds }
    if (data.created_at) {
      const parsedDate = normalizeDate(data.created_at);
      if (parsedDate) {
        data.created_at = parsedDate;
      } else {
        delete data.created_at;
      }
    } else {
      delete data.created_at;
    }

    if (data.rol && !data.role_id) {
      data.role_id = data.rol;
    }

    const tokens = generateSearchTokens(data.name, data.user, data.email, data.phone);
    const newUser = new User({
      ...data,
      search_keywords: tokens,
    });
    await newUser.save();
    return res.status(201).json({ success: true, user: newUser.toJSON() });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.id) delete data.id;

    if (data.created_at) {
      const parsedDate = normalizeDate(data.created_at);
      if (parsedDate) {
        data.created_at = parsedDate;
      } else {
        delete data.created_at;
      }
    }

    if (data.rol && !data.role_id) {
      data.role_id = data.rol;
    }

    if (data.name || data.user || data.email || data.phone) {
      data.search_keywords = generateSearchTokens(data.name, data.user, data.email, data.phone);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    return res.json({ success: true, user: updated.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    user.status = !user.status;
    await user.save();
    return res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserSedes = async (req, res) => {
  try {
    const { sedes } = req.body;
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, { sedes }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    if (Array.isArray(sedes)) {
      await Sede.updateMany(
        { _id: { $nin: sedes }, user_ids: userId },
        { $pull: { user_ids: userId } }
      );
      await Sede.updateMany(
        { _id: { $in: sedes } },
        { $addToSet: { user_ids: userId } }
      );
    }

    return res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { categories }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    return res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  updateUserSedes,
  updateUserCategories,
};
