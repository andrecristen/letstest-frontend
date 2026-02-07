import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { Badge, Button, Card } from "../../ui";
import LoadingOverlay from "../../components/LoadingOverlay";
import { createCheckout, getPlans } from "../../services/billingService";
import type { BillingPlan } from "../../models/BillingData";
import notifyProvider from "../../infra/notifyProvider";

const PlanSelection: React.FC = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPlans()
      .then((response) => setPlans(response?.data ?? []))
      .catch(() => notifyProvider.error(t("billing.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const handleCheckout = async (planKey: string) => {
    try {
      const response = await createCheckout(planKey);
      if (response?.data?.url) {
        window.location.assign(response.data.url);
      }
    } catch {
      notifyProvider.error(t("billing.checkoutError"));
    }
  };

  const formatLimit = (value: number | null, isStorage?: boolean) => {
    if (value === null) return t("billing.unlimited");
    if (isStorage) {
      const gb = value / (1024 * 1024 * 1024);
      return `${gb.toFixed(1)} GB`;
    }
    return String(value);
  };

  return (
    <PainelContainer>
      <LoadingOverlay show={loading} />
      <div className="space-y-6">
        <TitleContainer
          title={t("billing.plansTitle")}
          textHelp={t("billing.plansSubtitle")}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.key} className="space-y-4 p-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                  {plan.name}
                </p>
                <h3 className="font-display text-xl text-ink">{plan.name}</h3>
                <p className="text-sm text-ink/60">
                  {plan.priceMonthlyCents === 0
                    ? t("billing.freePrice")
                    : t("billing.priceMonthly", {
                        value: (plan.priceMonthlyCents ?? 0) / 100,
                      })}
                </p>
              </div>
              <div className="space-y-2 text-sm text-ink/70">
                <p>{t("billing.metricSeats")}: {formatLimit(plan.limits.seats)}</p>
                <p>{t("billing.metricProjects")}: {formatLimit(plan.limits.projects)}</p>
                <p>{t("billing.metricTestCases")}: {formatLimit(plan.limits.test_cases)}</p>
                <p>{t("billing.metricStorage")}: {formatLimit(plan.limits.storage_bytes, true)}</p>
                <p>{t("billing.metricExecutions")}: {formatLimit(plan.limits.test_executions)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.features.apiAccess ? (
                  <Badge variant="success">{t("billing.apiAccess")}</Badge>
                ) : (
                  <Badge variant="neutral">{t("billing.apiNoAccess")}</Badge>
                )}
                <Badge variant="neutral">
                  {plan.features.webhooks === null
                    ? t("billing.webhooksUnlimited")
                    : t("billing.webhooksCount", { count: plan.features.webhooks })}
                </Badge>
              </div>
              {plan.priceMonthlyCents !== 0 ? (
                <Button onClick={() => handleCheckout(plan.key)}>
                  {t("billing.choosePlan")}
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  {t("billing.currentPlan")}
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </PainelContainer>
  );
};

export default PlanSelection;
