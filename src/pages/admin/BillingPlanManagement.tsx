import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiRefreshCw, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import * as adminService from "../../services/adminService";
import type { AdminBillingPlan, UpdatePlanData } from "../../services/adminService";
import tokenProvider from "../../infra/tokenProvider";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input, Badge } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import Modal from "../../ui/Modal";

const SYSTEM_ACCESS_LEVEL = 99;

const formatBytes = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return "Unlimited";
  const gb = 1024 * 1024 * 1024;
  const mb = 1024 * 1024;
  if (bytes >= gb) return `${(bytes / gb).toFixed(0)} GB`;
  if (bytes >= mb) return `${(bytes / mb).toFixed(0)} MB`;
  return `${bytes} B`;
};

const formatPrice = (cents: number | null): string => {
  if (cents === null || cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}/mo`;
};

const formatLimit = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "Unlimited";
  return value.toLocaleString();
};

const BillingPlanManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [plans, setPlans] = useState<AdminBillingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<AdminBillingPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editSeats, setEditSeats] = useState("");
  const [editProjects, setEditProjects] = useState("");
  const [editTestCases, setEditTestCases] = useState("");
  const [editStorageBytes, setEditStorageBytes] = useState("");
  const [editTestExecutions, setEditTestExecutions] = useState("");
  const [editApiAccess, setEditApiAccess] = useState(false);
  const [editWebhooks, setEditWebhooks] = useState("");
  const [editAuditLogsDays, setEditAuditLogsDays] = useState("");

  useEffect(() => {
    const accessLevel = tokenProvider.getAccessLevel();
    if (!accessLevel || accessLevel < SYSTEM_ACCESS_LEVEL) {
      notifyProvider.error(t("admin.accessDenied"));
      navigate("/dashboard");
    }
  }, [navigate, t]);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAdminPlans();
      if (response?.status === 200) {
        setPlans(response.data ?? []);
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

  useEffect(() => {
    const accessLevel = tokenProvider.getAccessLevel();
    if (accessLevel && accessLevel >= SYSTEM_ACCESS_LEVEL) {
      loadPlans();
    }
  }, [loadPlans]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await adminService.syncAdminPlans();
      if (response?.status === 200) {
        notifyProvider.success(t("admin.syncSuccess", { count: response.data?.synced ?? 0 }));
        loadPlans();
      } else {
        notifyProvider.error(t("admin.syncError"));
      }
    } catch {
      notifyProvider.error(t("admin.syncError"));
    } finally {
      setSyncing(false);
    }
  };

  const parseLimitValue = (value: string): number | null => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "" || trimmed === "null" || trimmed === "unlimited") return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  };

  const openEditModal = (plan: AdminBillingPlan) => {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditPrice(plan.priceMonthlyCents !== null ? String(plan.priceMonthlyCents) : "");
    setEditActive(plan.active);
    setEditSeats(plan.limits?.seats != null ? String(plan.limits.seats) : "");
    setEditProjects(plan.limits?.projects != null ? String(plan.limits.projects) : "");
    setEditTestCases(plan.limits?.test_cases != null ? String(plan.limits.test_cases) : "");
    setEditStorageBytes(plan.limits?.storage_bytes != null ? String(plan.limits.storage_bytes) : "");
    setEditTestExecutions(plan.limits?.test_executions != null ? String(plan.limits.test_executions) : "");
    setEditApiAccess(plan.features?.apiAccess ?? false);
    setEditWebhooks(plan.features?.webhooks != null ? String(plan.features.webhooks) : "");
    setEditAuditLogsDays(plan.features?.auditLogsDays != null ? String(plan.features.auditLogsDays) : "");
  };

  const closeEditModal = () => {
    setEditingPlan(null);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    if (!editName.trim()) {
      notifyProvider.error(t("admin.nameRequired"));
      return;
    }

    setSaving(true);
    try {
      const data: UpdatePlanData = {
        name: editName.trim(),
        priceMonthlyCents: parseLimitValue(editPrice),
        active: editActive,
        limits: {
          seats: parseLimitValue(editSeats),
          projects: parseLimitValue(editProjects),
          test_cases: parseLimitValue(editTestCases),
          storage_bytes: parseLimitValue(editStorageBytes),
          test_executions: parseLimitValue(editTestExecutions),
        },
        features: {
          apiAccess: editApiAccess,
          webhooks: parseLimitValue(editWebhooks),
          auditLogsDays: parseLimitValue(editAuditLogsDays),
        },
      };

      const response = await adminService.updateAdminPlan(editingPlan.id, data);
      if (response?.status === 200) {
        notifyProvider.success(t("admin.saveSuccess"));
        closeEditModal();
        loadPlans();
      } else {
        notifyProvider.error(response?.data?.error || t("admin.saveError"));
      }
    } catch {
      notifyProvider.error(t("admin.saveError"));
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

  return (
    <PainelContainer>
      <LoadingOverlay show={loading} />
      <TitleContainer
        title={t("admin.billingPlans")}
        textHelp={t("admin.billingPlansSubtitle")}
      />

      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">{t("admin.plansList")}</h3>
          <Button
            onClick={handleSync}
            isLoading={syncing}
            variant="outline"
            leadingIcon={<FiRefreshCw />}
          >
            {t("admin.syncFromStripe")}
          </Button>
        </div>

        {plans.length === 0 ? (
          <p className="text-sm text-ink/60">{t("admin.noPlans")}</p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border border-ink/10 bg-paper/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-ink">{plan.name}</span>
                      <code className="rounded bg-ink/5 px-2 py-0.5 text-xs text-ink/60">
                        {plan.key}
                      </code>
                      <Badge variant={plan.active ? "success" : "neutral"} className="text-xs">
                        {plan.active ? t("admin.active") : t("admin.inactive")}
                      </Badge>
                      <Badge variant={plan.configured ? "success" : "danger"} className="text-xs">
                        {plan.configured ? t("admin.configured") : t("admin.notConfigured")}
                      </Badge>
                    </div>

                    <div className="text-sm font-medium text-ink/70">
                      {formatPrice(plan.priceMonthlyCents)}
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-5">
                      <div>
                        <span className="text-ink/50">{t("admin.limitsSeats")}: </span>
                        <span className="font-medium text-ink">{formatLimit(plan.limits?.seats)}</span>
                      </div>
                      <div>
                        <span className="text-ink/50">{t("admin.limitsProjects")}: </span>
                        <span className="font-medium text-ink">{formatLimit(plan.limits?.projects)}</span>
                      </div>
                      <div>
                        <span className="text-ink/50">{t("admin.limitsTestCases")}: </span>
                        <span className="font-medium text-ink">{formatLimit(plan.limits?.test_cases)}</span>
                      </div>
                      <div>
                        <span className="text-ink/50">{t("admin.limitsStorage")}: </span>
                        <span className="font-medium text-ink">{formatBytes(plan.limits?.storage_bytes)}</span>
                      </div>
                      <div>
                        <span className="text-ink/50">{t("admin.limitsExecutions")}: </span>
                        <span className="font-medium text-ink">{formatLimit(plan.limits?.test_executions)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {plan.features?.apiAccess ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiX className="text-ink/30" />
                        )}
                        <span className="text-ink/70">{t("admin.featuresApiAccess")}</span>
                      </div>
                      <div>
                        <span className="text-ink/50">{t("admin.featuresWebhooks")}: </span>
                        <span className="font-medium text-ink">{formatLimit(plan.features?.webhooks)}</span>
                      </div>
                      <div>
                        <span className="text-ink/50">{t("admin.featuresAuditLogs")}: </span>
                        <span className="font-medium text-ink">
                          {plan.features?.auditLogsDays != null
                            ? t("admin.days", { count: plan.features.auditLogsDays })
                            : t("admin.unlimited")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => openEditModal(plan)}
                  >
                    <FiEdit2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!editingPlan} onClose={closeEditModal} className="max-w-lg max-h-[90vh] flex flex-col">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
            {editingPlan?.key}
          </p>
          <h2 className="font-display text-xl text-ink">
            {t("admin.editPlan")}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <Field label={t("admin.planName")}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Field>

            <Field label={t("admin.planPrice")}>
              <Input
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder={t("admin.pricePlaceholder")}
              />
              <p className="mt-1 text-xs text-ink/50">{t("admin.priceHint")}</p>
            </Field>

            <Field label={t("admin.planActive")}>
              <button
                type="button"
                onClick={() => setEditActive(!editActive)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  editActive
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-ink/20 text-ink/60 hover:border-ink/40"
                }`}
              >
                {editActive ? t("admin.active") : t("admin.inactive")}
              </button>
            </Field>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">{t("admin.limitsTitle")}</p>
              <p className="mb-3 text-xs text-ink/50">{t("admin.limitsHint")}</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("admin.limitsSeats")}>
                  <Input
                    value={editSeats}
                    onChange={(e) => setEditSeats(e.target.value)}
                    placeholder={t("admin.unlimited")}
                  />
                </Field>
                <Field label={t("admin.limitsProjects")}>
                  <Input
                    value={editProjects}
                    onChange={(e) => setEditProjects(e.target.value)}
                    placeholder={t("admin.unlimited")}
                  />
                </Field>
                <Field label={t("admin.limitsTestCases")}>
                  <Input
                    value={editTestCases}
                    onChange={(e) => setEditTestCases(e.target.value)}
                    placeholder={t("admin.unlimited")}
                  />
                </Field>
                <Field label={t("admin.limitsStorage")}>
                  <Input
                    value={editStorageBytes}
                    onChange={(e) => setEditStorageBytes(e.target.value)}
                    placeholder={t("admin.unlimited")}
                  />
                </Field>
                <Field label={t("admin.limitsExecutions")}>
                  <Input
                    value={editTestExecutions}
                    onChange={(e) => setEditTestExecutions(e.target.value)}
                    placeholder={t("admin.unlimited")}
                  />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">{t("admin.featuresTitle")}</p>
              <div className="space-y-3">
                <Field label={t("admin.featuresApiAccess")}>
                  <button
                    type="button"
                    onClick={() => setEditApiAccess(!editApiAccess)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      editApiAccess
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-ink/20 text-ink/60 hover:border-ink/40"
                    }`}
                  >
                    {editApiAccess ? t("admin.enabled") : t("admin.disabled")}
                  </button>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("admin.featuresWebhooks")}>
                    <Input
                      value={editWebhooks}
                      onChange={(e) => setEditWebhooks(e.target.value)}
                      placeholder={t("admin.unlimited")}
                    />
                  </Field>
                  <Field label={t("admin.featuresAuditLogs")}>
                    <Input
                      value={editAuditLogsDays}
                      onChange={(e) => setEditAuditLogsDays(e.target.value)}
                      placeholder={t("admin.unlimited")}
                    />
                  </Field>
                </div>
              </div>
            </div>

        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-ink/10 mt-4">
          <Button variant="ghost" onClick={closeEditModal}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </PainelContainer>
  );
};

export default BillingPlanManagement;
