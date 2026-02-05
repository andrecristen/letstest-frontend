import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { Badge, Button, Card } from "../../ui";
import LoadingOverlay from "../../components/LoadingOverlay";
import { getPlans, getUsage, createPortal } from "../../services/billingService";
import type { BillingPlan, BillingUsageSummary, BillingMetricKey } from "../../models/BillingData";
import { useConfig } from "../../contexts/ConfigContext";
import notifyProvider from "../../infra/notifyProvider";

const BillingOverview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billingEnabled } = useConfig();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [usage, setUsage] = useState<BillingUsageSummary | null>(null);

  useEffect(() => {
    if (!billingEnabled) return;
    setLoading(true);
    Promise.all([getPlans(), getUsage()])
      .then(([plansResponse, usageResponse]) => {
        setPlans(plansResponse?.data ?? []);
        setUsage(usageResponse?.data ?? null);
      })
      .catch(() => notifyProvider.error(t("billing.loadError")))
      .finally(() => setLoading(false));
  }, [billingEnabled, t]);

  const currentPlan = useMemo(() => {
    if (!usage) return null;
    return plans.find((plan) => plan.key === usage.plan) ?? null;
  }, [plans, usage]);

  const metricRows: Array<{ key: BillingMetricKey; label: string }> = [
    { key: "seats", label: t("billing.metricSeats") },
    { key: "projects", label: t("billing.metricProjects") },
    { key: "test_cases", label: t("billing.metricTestCases") },
    { key: "storage_bytes", label: t("billing.metricStorage") },
    { key: "test_executions", label: t("billing.metricExecutions") },
  ];

  const formatLimit = (value?: number | null, key?: BillingMetricKey) => {
    if (value === null || value === undefined) return t("billing.unlimited");
    if (key === "storage_bytes") {
      const gb = value / (1024 * 1024 * 1024);
      return `${gb.toFixed(1)} GB`;
    }
    return String(value);
  };

  const formatUsage = (value?: number, key?: BillingMetricKey) => {
    if (value === null || value === undefined) return "-";
    if (key === "storage_bytes") {
      const gb = value / (1024 * 1024 * 1024);
      return `${gb.toFixed(2)} GB`;
    }
    return String(value);
  };

  const handleOpenPortal = async () => {
    try {
      const response = await createPortal();
      if (response?.data?.url) {
        window.location.assign(response.data.url);
      }
    } catch {
      notifyProvider.error(t("billing.portalError"));
    }
  };

  if (!billingEnabled) {
    return (
      <PainelContainer>
        <Card className="p-6 text-sm text-ink/60">
          {t("billing.disabled")}
        </Card>
      </PainelContainer>
    );
  }

  return (
    <PainelContainer>
      <LoadingOverlay show={loading} />
      <div className="space-y-6">
        <TitleContainer
          title={t("billing.title")}
          textHelp={t("billing.subtitle")}
        />

        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                {t("billing.currentPlan")}
              </p>
              <h3 className="font-display text-xl text-ink">
                {currentPlan?.name ?? t("billing.planFree")}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/billing/plans")}>
                {t("billing.changePlan")}
              </Button>
              <Button onClick={handleOpenPortal}>
                {t("billing.manageBilling")}
              </Button>
            </div>
          </div>
          {currentPlan ? (
            <div className="flex flex-wrap gap-2 text-sm text-ink/60">
              {currentPlan.features.apiAccess ? (
                <Badge variant="success">{t("billing.apiAccess")}</Badge>
              ) : (
                <Badge variant="neutral">{t("billing.apiNoAccess")}</Badge>
              )}
              <Badge variant="neutral">
                {currentPlan.features.webhooks === null
                  ? t("billing.webhooksUnlimited")
                  : t("billing.webhooksCount", { count: currentPlan.features.webhooks })}
              </Badge>
              <Badge variant="neutral">
                {currentPlan.features.auditLogsDays === null
                  ? t("billing.auditLogsUnlimited")
                  : t("billing.auditLogsDays", { count: currentPlan.features.auditLogsDays })}
              </Badge>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-ink">{t("billing.usageTitle")}</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {metricRows.map((metric) => (
                <div
                  key={metric.key}
                  className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm"
                >
                  <span className="text-ink/70">{metric.label}</span>
                  <span className="text-ink">
                    {formatUsage(usage?.usage?.[metric.key], metric.key)} / {formatLimit(usage?.limits?.[metric.key], metric.key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </PainelContainer>
  );
};

export default BillingOverview;
