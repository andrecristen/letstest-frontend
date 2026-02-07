import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiEdit2, FiSearch } from "react-icons/fi";
import * as adminService from "../../services/adminService";
import type { AdminSubscription, AdminBillingPlan } from "../../services/adminService";
import tokenProvider from "../../infra/tokenProvider";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Badge } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import Modal from "../../ui/Modal";

const SYSTEM_ACCESS_LEVEL = 99;

const getPlanBadgeVariant = (plan: AdminBillingPlan | null | undefined) => {
  if (!plan) return "neutral" as const;
  if ((plan.priceMonthlyCents ?? 0) === 0) return "neutral" as const;
  return "info" as const;
};

const statusColors: Record<string, "success" | "danger" | "neutral"> = {
  active: "success",
  canceled: "danger",
};

const formatDate = (value: string | null): string => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
};

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [plans, setPlans] = useState<AdminBillingPlan[]>([]);
  const [search, setSearch] = useState("");
  const [editingSub, setEditingSub] = useState<AdminSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const accessLevel = tokenProvider.getAccessLevel();
    if (!accessLevel || accessLevel < SYSTEM_ACCESS_LEVEL) {
      notifyProvider.error(t("admin.accessDenied"));
      navigate("/dashboard");
    }
  }, [navigate, t]);

  const loadSubscriptions = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      const response = await adminService.getAdminSubscriptions(searchTerm);
      if (response?.status === 200) {
        setSubscriptions(response.data ?? []);
      } else if (response?.status === 403) {
        notifyProvider.error(t("admin.accessDenied"));
        navigate("/dashboard");
      } else {
        notifyProvider.error(t("admin.loadError"));
      }
    } catch {
      notifyProvider.error(t("admin.loadError"));
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  const loadPlans = useCallback(async () => {
    try {
      const response = await adminService.getAdminPlans();
      if (response?.status === 200) {
        const nextPlans = response.data ?? [];
        setPlans(nextPlans);
      }
    } catch {
      // Silent fail: subscription view still works without plan list.
    }
  }, []);

  useEffect(() => {
    const accessLevel = tokenProvider.getAccessLevel();
    if (accessLevel && accessLevel >= SYSTEM_ACCESS_LEVEL) {
      loadSubscriptions();
      loadPlans();
    }
  }, [loadPlans, loadSubscriptions]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadSubscriptions(value);
    }, 400);
  };

  const openEditModal = (sub: AdminSubscription) => {
    setEditingSub(sub);
    setSelectedPlan(sub.plan);
  };

  const closeEditModal = () => {
    setEditingSub(null);
  };

  const handleSave = async () => {
    if (!editingSub) return;
    setSaving(true);
    try {
      const response = await adminService.updateAdminSubscription(editingSub.id, { plan: selectedPlan });
      if (response?.status === 200) {
        notifyProvider.success(t("admin.planChangeSuccess"));
        closeEditModal();
        loadSubscriptions(search);
      } else {
        notifyProvider.error(response?.data?.error || t("admin.planChangeError"));
      }
    } catch {
      notifyProvider.error(t("admin.planChangeError"));
    } finally {
      setSaving(false);
    }
  };

  const accessLevel = tokenProvider.getAccessLevel();
  if (!accessLevel || accessLevel < SYSTEM_ACCESS_LEVEL) {
    return (
      <PainelContainer>
        <Card className="p-6">
          <p className="text-ink/60">{t("admin.accessDenied")}</p>
        </Card>
      </PainelContainer>
    );
  }

  const getPlanByKey = (planKey?: string | null) =>
    plans.find((plan) => plan.key === planKey) ?? null;

  const editablePlans = plans
    .filter((plan) => plan.active && plan.configured)
    .sort((a, b) => (a.priceMonthlyCents ?? 0) - (b.priceMonthlyCents ?? 0));

  return (
    <PainelContainer>
      <LoadingOverlay show={loading} />
      <TitleContainer
        title={t("admin.subscriptions")}
        textHelp={t("admin.subscriptionsSubtitle")}
      />

      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-ink">{t("admin.subscriptionsList")}</h3>
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("admin.searchOrg")}
              className="w-full rounded-lg border border-ink/15 bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <p className="text-sm text-ink/60">{t("admin.noSubscriptions")}</p>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border border-ink/10 bg-paper/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-ink">
                        {sub.organization?.name ?? `Org #${sub.organizationId}`}
                      </span>
                      <code className="rounded bg-ink/5 px-2 py-0.5 text-xs text-ink/60">
                        {sub.organization?.slug}
                      </code>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant={getPlanBadgeVariant(getPlanByKey(sub.plan))}
                        className="text-xs"
                      >
                        {getPlanByKey(sub.plan)?.name ?? sub.plan}
                      </Badge>
                      <Badge variant={statusColors[sub.status] ?? "neutral"} className="text-xs">
                        {sub.status}
                      </Badge>
                      {sub.cancelAtPeriodEnd && (
                        <Badge variant="danger" className="text-xs">
                          {t("admin.cancelsAtEnd")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/60">
                      {sub.stripeCustomerId && (
                        <div>
                          <span className="text-ink/40">Stripe: </span>
                          <span className="font-mono text-xs">{sub.stripeCustomerId}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-ink/40">{t("admin.periodStart")}: </span>
                        <span>{formatDate(sub.currentPeriodStart)}</span>
                      </div>
                      <div>
                        <span className="text-ink/40">{t("admin.periodEnd")}: </span>
                        <span>{formatDate(sub.currentPeriodEnd)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => openEditModal(sub)}
                  >
                    <FiEdit2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!editingSub} onClose={closeEditModal} className="max-w-md">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
            {editingSub?.organization?.name}
          </p>
          <h2 className="font-display text-xl text-ink">
            {t("admin.changePlan")}
          </h2>
        </div>

        <div className="space-y-4">
          <Field label={t("admin.currentPlan")}>
            <Badge
              variant={getPlanBadgeVariant(getPlanByKey(editingSub?.plan))}
              className="text-sm"
            >
              {getPlanByKey(editingSub?.plan)?.name ?? editingSub?.plan}
            </Badge>
          </Field>

          <Field label={t("admin.newPlan")}>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {editablePlans.map((plan) => (
                <option key={plan.id} value={plan.key}>
                  {plan.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-ink/10 mt-4">
          <Button variant="ghost" onClick={closeEditModal}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} isLoading={saving} disabled={selectedPlan === editingSub?.plan}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </PainelContainer>
  );
};

export default SubscriptionManagement;
