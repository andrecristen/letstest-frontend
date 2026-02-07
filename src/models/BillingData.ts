export type BillingMetricKey =
  | "seats"
  | "projects"
  | "test_cases"
  | "storage_bytes"
  | "test_executions";

export type BillingPlan = {
  key: string;
  name: string;
  priceMonthlyCents: number | null;
  limits: Record<BillingMetricKey, number | null>;
  features: {
    apiAccess: boolean;
    webhooks: number | null;
    auditLogsDays: number | null;
  };
};

export type BillingUsageSummary = {
  plan: string;
  limits: Record<BillingMetricKey, number | null>;
  usage: Partial<Record<BillingMetricKey, number>>;
};
