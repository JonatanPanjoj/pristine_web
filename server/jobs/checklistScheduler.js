const cron = require('node-cron');
const { ChecklistSchedule, ChecklistRevision, SystemNotification } = require('../models');
const { createSystemNotification } = require('../services/notificationService');

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Función que evalúa si faltan exactamente 10 minutos para la hora de cierre de los checklists.
 */
const checkPendingChecklistsAndNotify = async () => {
  try {
    const now = new Date();
    const currentDay = DAYS_OF_WEEK[now.getDay()]; // Ej: 'monday'
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Buscar horarios activos
    const schedules = await ChecklistSchedule.find({
      $or: [{ status: 'active' }, { isEnabled: true }, { status: true }]
    });

    if (!schedules || schedules.length === 0) return;

    // Rango del día actual (00:00:00 a 23:59:59)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    for (const schedule of schedules) {
      // 1. Validar si aplica para el día de hoy
      if (schedule.activeDays) {
        const isDayActive = schedule.activeDays[currentDay];
        if (isDayActive === false) continue;
      }

      // 2. Extraer y comparar endTime (formato esperado: "HH:mm")
      const endTimeStr = schedule.endTime;
      if (!endTimeStr || typeof endTimeStr !== 'string' || !endTimeStr.includes(':')) continue;

      const [endH, endM] = endTimeStr.split(':').map(Number);
      if (isNaN(endH) || isNaN(endM)) continue;

      const endTotalMinutes = endH * 60 + endM;
      const minutesRemaining = endTotalMinutes - currentTotalMinutes;

      // Evaluar si faltan exactamente 10 minutos (o entre 9 y 10 minutos para absorber delays de cron)
      if (minutesRemaining !== 10) continue;

      const userId = schedule.user_id || schedule.userId;
      if (!userId) continue;

      const scheduleIdStr = schedule._id.toString();

      // 3. Verificar si el usuario ya completó la revisión el día de hoy
      const completedRevision = await ChecklistRevision.findOne({
        $or: [
          { schedule_id: scheduleIdStr },
          { scheduleId: scheduleIdStr }
        ],
        status: 'completed',
        created_at: { $gte: startOfToday, $lte: endOfToday }
      });

      if (completedRevision) {
        // Ya fue completada hoy, no es necesario alertar
        continue;
      }

      // 4. Verificar si ya se envió notificación para este horario el día de hoy
      const alreadyNotified = await SystemNotification.findOne({
        user_id: userId,
        type: 'checklist_reminder',
        'data.scheduleId': scheduleIdStr,
        created_at: { $gte: startOfToday, $lte: endOfToday }
      });

      if (alreadyNotified) {
        // Ya se le notificó hoy
        continue;
      }

      // 5. Emitir notificación y push notification
      const checklistTitle = schedule.checklist_name || schedule.checklistName || 'Checklist';
      console.log(`[Scheduler] Enviando recordatorio de 10 min a usuario ${userId} para checklist "${checklistTitle}"`);

      await createSystemNotification({
        userId,
        title: '¡Recordatorio de Checklist!',
        body: `Faltan 10 minutos para el cierre de tu lista "${checklistTitle}". Recuerda completarla a tiempo.`,
        type: 'checklist_reminder',
        data: {
          checklistId: schedule.checklist_id || schedule.checklistId || '',
          scheduleId: scheduleIdStr,
          endTime: endTimeStr,
        },
        sendPush: true,
      });
    }
  } catch (error) {
    console.error('[Scheduler] Error en verificación de checklists programados:', error);
  }
};

// Iniciar cron job cada minuto
const startChecklistScheduler = () => {
  cron.schedule('* * * * *', () => {
    checkPendingChecklistsAndNotify();
  });
  console.log('✔ Scheduler de alertas de checklists iniciado (ejecución cada minuto)');
};

module.exports = {
  startChecklistScheduler,
  checkPendingChecklistsAndNotify,
};
