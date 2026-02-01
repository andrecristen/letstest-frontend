import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export type NotificationItem = {
  id: number;
  userId: number;
  notificationId: number;
  readAt?: string | null;
  notification: {
    id: number;
    type: number;
    title: string;
    message: string;
    projectId?: number | null;
    metadata?: any;
    createdAt: string;
  };
};

export const getNotifications = async (page = 1, limit = 20) => {
  return await apiTokenProvider.get("/notifications", { params: { page, limit } });
};

export const getUnreadCount = async () => {
  return await apiTokenProvider.get("/notifications/unread-count");
};

export const markNotificationRead = async (notificationId: number) => {
  return await apiTokenProvider.put(`/notifications/read/${notificationId}`, {});
};

export const markAllRead = async () => {
  return await apiTokenProvider.put("/notifications/read-all", {});
};
