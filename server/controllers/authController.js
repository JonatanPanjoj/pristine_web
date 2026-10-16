const { User, Role } = require('../models');

// Función para generar o comparar contraseñas
// El frontend usa un cifrado XOR + Base64 con el username como clave
const login = async (req, res) => {
  try {
    const { user, password } = req.body;
    if (!user || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }

    const foundUser = await User.findOne({ user: user.trim() });
    if (!foundUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!foundUser.status) {
      return res.status(403).json({ success: false, message: 'El usuario se encuentra inactivo' });
    }

    // Comprobamos contraseña (coincidencia directa con el hash/token enviado por el cliente)
    if (foundUser.password !== password) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Obtenemos rol y permisos
    let permissions = [];
    let roleName = '';
    const roleIdentifier = foundUser.rol || foundUser.role_id;
    if (roleIdentifier) {
      const mongoose = require('mongoose');
      let roleDoc = null;
      if (mongoose.Types.ObjectId.isValid(roleIdentifier)) {
        roleDoc = await Role.findById(roleIdentifier);
      }
      if (!roleDoc) {
        roleDoc = await Role.findOne({ name: roleIdentifier });
      }
      if (roleDoc) {
        roleName = roleDoc.name;
        if (roleDoc.permissions && roleDoc.permissions.length > 0) {
          permissions = roleDoc.permissions;
        }
      }
    }

    const userObj = foundUser.toJSON();
    userObj.is_enabled = foundUser.is_enabled !== undefined ? foundUser.is_enabled : (foundUser.status !== false);
    userObj.status = userObj.is_enabled;
    userObj.permissions = permissions;
    userObj.rol_name = roleName;

    return res.json({
      success: true,
      data: userObj,
      user: userObj
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ success: true, message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  changePassword,
};
