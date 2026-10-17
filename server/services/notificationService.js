const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { SystemNotification, User } = require('../models');

// Inicializar Firebase Admin SDK si existe el archivo de credenciales
let firebaseAdminInitialized = false;

const initFirebaseAdmin = () => {
  if (firebaseAdminInitialized) return true;

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../serviceAccountKey.json');
  
  if (fs.existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'leaguer-2ed58',
      });
      firebaseAdminInitialized = true;
      console.log('✔ Firebase Admin SDK inicializado correctamente con proyecto:', serviceAccount.project_id || 'leaguer-2ed58');
      return true;
    } catch (err) {
      console.error('⚠ Error al inicializar Firebase Admin SDK:', err.message);
      return false;
    }
  } else {
    console.warn(`⚠ Firebase Admin no inicializado: no se encontró "${keyPath}". Los push notifications se omitirán hasta que se cargue la clave privada.`);
    return false;
  }
};

// Intentar inicializar al cargar
initFirebaseAdmin();

/**
 * Enviar mensaje push mediante FCM a una lista de tokens.
 */
const sendPushNotification = async (tokens, { title, body, data = {} }) => {
  if (!initFirebaseAdmin()) {
    console.log('[FCM] Omitiendo push notification (Firebase Admin no inicializado)');
    return { success: false, reason: 'Firebase Admin no inicializado' };
  }

  if (!tokens || !tokens.length) {
    return { success: false, reason: 'No hay tokens destino' };
  }

  // Filtrar tokens nulos o vacíos
  const validTokens = Array.from(new Set(tokens.filter(t => typeof t === 'string' && t.trim().length > 0)));
  if (!validTokens.length) return { success: false, reason: 'Tokens inválidos' };

  // Convertir todos los valores de `data` a strings requeridos por FCM
  const stringifiedData = {};
  for (const [key, value] of Object.entries(data)) {
    stringifiedData[key] = value !== null && value !== undefined ? String(value) : '';
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: stringifiedData,
    tokens: validTokens,
    android: {
      priority: 'high',
      notification: {
        channelId: 'pristine_checklist_channel',
        sound: 'default',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[FCM] Notificaciones enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`);

    // Detectar tokens vencidos o no registrados para eliminarlos de MongoDB
    const tokensToRemove = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          tokensToRemove.push(validTokens[idx]);
        }
      }
    });

    if (tokensToRemove.length > 0) {
      console.log(`[FCM] Limpiando ${tokensToRemove.length} tokens inválidos en la base de datos...`);
      await User.updateMany(
        { fcm_tokens: { $in: tokensToRemove } },
        { $pull: { fcm_tokens: { $in: tokensToRemove } } }
      );
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[FCM] Error al enviar notificación push:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Guarda la notificación en la colección `system_notifications` de MongoDB
 * y opcionalmente envía el push notification a los dispositivos del usuario.
 */
const createSystemNotification = async ({ userId, title, body, type = 'checklist_reminder', data = {}, sendPush = true }) => {
  try {
    // 1. Guardar en MongoDB colección system_notifications
    const notification = await SystemNotification.create({
      user_id: userId,
      title,
      body,
      type,
      data,
      read: false,
    });

    // 2. Enviar push notification vía FCM
    if (sendPush) {
      const user = await User.findById(userId);
      if (user && Array.isArray(user.fcm_tokens) && user.fcm_tokens.length > 0) {
        await sendPushNotification(user.fcm_tokens, {
          title,
          body,
          data: {
            ...data,
            notificationId: notification._id.toString(),
            type,
          },
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error al crear notificación de sistema:', error);
    throw error;
  }
};

module.exports = {
  initFirebaseAdmin,
  sendPushNotification,
  createSystemNotification,
};
