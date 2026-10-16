import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  sentAt?: any;
  isRead?: boolean;
  type?: string;
  module?: string;
  [key: string]: any;
}

export const useNotifications = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const hasMore = false;

  useEffect(() => {
    // Listo para sincronizar con MongoDB API /api/notifications si está disponible
    setNotifications([]);
    setLoading(false);
  }, [user?.id]);

  // Cargar más (paginación)
  const loadMore = async () => {};

  // Marcar todas como vistas
  const markAllAsSeen = async () => {};

  // Marcar una notificación individual como leída
  const markAsRead = async (notificationId: string) => {};

  return {
    notifications,
    loading,
    hasMore,
    hasUnseen: false,
    loadMore,
    markAllAsSeen,
    markAsRead,
  };
};

export default useNotifications;
