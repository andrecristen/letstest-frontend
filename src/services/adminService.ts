import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export interface AdminBillingPlan {
  id: number;
  key: string;
  name: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  priceMonthlyCents: number | null;
  limits: {
    seats: number | null;
    projects: number | null;
    test_cases: number | null;
    storage_bytes: number | null;
    test_executions: number | null;
  };
  features: {
    apiAccess: boolean;
    webhooks: number | null;
    auditLogsDays: number | null;
  };
  configured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePlanData {
  name?: string;
  priceMonthlyCents?: number | null;
  active?: boolean;
  limits?: {
    seats: number | null;
    projects: number | null;
    test_cases: number | null;
    storage_bytes: number | null;
    test_executions: number | null;
  };
  features?: {
    apiAccess: boolean;
    webhooks: number | null;
    auditLogsDays: number | null;
  };
}

export const getAdminPlans = async () => {
  return await apiTokenProvider.get("/admin/billing/plans");
};

export const syncAdminPlans = async () => {
  return await apiTokenProvider.post("/admin/billing/plans/sync", {});
};

export const updateAdminPlan = async (id: number, data: UpdatePlanData) => {
  return await apiTokenProvider.patch(`/admin/billing/plans/${id}`, data);
};

export interface AdminSubscription {
  id: number;
  organizationId: number;
  organization: {
    id: number;
    name: string;
    slug: string;
  };
  plan: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAdminSubscriptions = async (search?: string) => {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return await apiTokenProvider.get(`/admin/billing/subscriptions${params}`);
};

export const updateAdminSubscription = async (id: number, data: { plan: string }) => {
  return await apiTokenProvider.patch(`/admin/billing/subscriptions/${id}`, data);
};
