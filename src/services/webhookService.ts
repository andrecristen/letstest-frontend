import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export type WebhookEvent =
  | "test_execution.created"
  | "test_execution.reported"
  | "report.created"
  | "test_case.created"
  | "test_case.updated"
  | "test_scenario.created"
  | "involvement.accepted";

export interface Webhook {
  id: number;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: string;
  secret?: string;
  _count?: {
    deliveries: number;
  };
}

export interface WebhookDelivery {
  id: number;
  webhookId: number;
  event: string;
  payload: Record<string, any>;
  responseStatus: number | null;
  responseBody: string | null;
  deliveredAt: string | null;
  attempts: number;
  nextRetryAt: string | null;
  createdAt: string;
}

export const getWebhookEvents = async () => {
  return await apiTokenProvider.get("/webhooks/events");
};

export const getWebhooks = async () => {
  return await apiTokenProvider.get("/webhooks");
};

export const createWebhook = async (data: { url: string; events: WebhookEvent[] }) => {
  return await apiTokenProvider.post("/webhooks", data);
};

export const updateWebhook = async (
  id: number,
  data: { url?: string; events?: WebhookEvent[]; active?: boolean }
) => {
  return await apiTokenProvider.put(`/webhooks/${id}`, data);
};

export const deleteWebhook = async (id: number) => {
  return await apiTokenProvider.delete(`/webhooks/${id}`);
};

export const regenerateWebhookSecret = async (id: number) => {
  return await apiTokenProvider.post(`/webhooks/${id}/regenerate-secret`, {});
};

export const getWebhookDeliveries = async (id: number) => {
  return await apiTokenProvider.get(`/webhooks/${id}/deliveries`);
};
