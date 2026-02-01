import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export type NotificationSettings = {
  id: number;
  projectId: number;
  enableExecutionRejected: boolean;
  enableInviteAccepted: boolean;
  enableInviteReceived: boolean;
  enableDeadlineExceeded: boolean;
  enableDeadlineWarning: boolean;
  deadlineWarningDays: number;
  notifyEmail: boolean;
  notifyInApp: boolean;
};

export const getNotificationSettings = async (projectId: number) => {
  return await apiTokenProvider.get(`/notification-settings/${projectId}`);
};

export const updateNotificationSettings = async (
  projectId: number,
  data: Partial<NotificationSettings>
) => {
  return await apiTokenProvider.put(`/notification-settings/${projectId}`, data);
};
