const { SystemNotification, User } = require('../models');
const { createSystemNotification, sendPushNotification } = require('../services/notificationService');

/**
 * Obtener notificaciones para un usuario o para todo el sistema
 */
const getNotifications = async (req, res) => {
  try {
    const { userId, read, page = 1, limit = 50 } = req.query;
    const query = {};

    if (userId) {
      query.user_id = userId;
    }

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SystemNotification.countDocuments(query);
    const notifications = await SystemNotification.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      notifications: notifications.map(n => n.toJSON()),
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Marcar notificación como leída
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await SystemNotification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }

    return res.json({ success: true, notification: notification.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Endpoint manual para enviar notificación a un usuario
 */
const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, data = {}, type = 'system_alert' } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ success: false, message: 'userId, title y body son obligatorios' });
    }

    const notification = await createSystemNotification({
      userId,
      title,
      body,
      type,
      data,
      sendPush: true,
    });

    return res.json({ success: true, notification: notification.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  sendNotification,
};
