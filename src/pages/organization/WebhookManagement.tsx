import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2, FiCopy, FiRefreshCw, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as webhookService from "../../services/webhookService";
import type { Webhook, WebhookEvent, WebhookDelivery } from "../../services/webhookService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input, Badge } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import Modal from "../../ui/Modal";

const WEBHOOK_EVENTS: WebhookEvent[] = [
  "test_execution.created",
  "test_execution.reported",
  "report.created",
  "test_case.created",
  "test_case.updated",
  "test_scenario.created",
  "involvement.accepted",
];

const WebhookManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentOrganization, isOwner } = useOrganization();

  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookLimit, setWebhookLimit] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<WebhookEvent[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [expandedWebhook, setExpandedWebhook] = useState<number | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const response = await webhookService.getWebhooks();
      if (response?.status === 200) {
        setWebhooks(response.data?.webhooks ?? []);
        setWebhookLimit(response.data?.limit ?? null);
      } else if (response?.status === 403) {
        notifyProvider.error(t("webhooks.noAccess"));
      }
    } catch {
      notifyProvider.error(t("webhooks.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async (webhookId: number) => {
    setLoadingDeliveries(true);
    try {
      const response = await webhookService.getWebhookDeliveries(webhookId);
      if (response?.status === 200) {
        setDeliveries(response.data ?? []);
      }
    } catch {
      notifyProvider.error(t("webhooks.deliveriesError"));
    } finally {
      setLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    if (currentOrganization && isOwner) {
      loadWebhooks();
    }
  }, [currentOrganization, isOwner]);

  useEffect(() => {
    if (currentOrganization && !isOwner) {
      notifyProvider.error(t("organization.accessDenied"));
      navigate("/dashboard");
    }
  }, [currentOrganization, isOwner, navigate, t]);

  const handleCreate = async () => {
    if (!newWebhookUrl.trim()) {
      notifyProvider.error(t("webhooks.urlRequired"));
      return;
    }
    if (newWebhookEvents.length === 0) {
      notifyProvider.error(t("webhooks.eventsRequired"));
      return;
    }
    setCreating(true);
    try {
      const response = await webhookService.createWebhook({
        url: newWebhookUrl,
        events: newWebhookEvents,
      });
      if (response?.status === 201) {
        setCreatedSecret(response.data.secret);
        notifyProvider.success(t("webhooks.createSuccess"));
        loadWebhooks();
      } else {
        notifyProvider.error(response?.data?.error || t("webhooks.createError"));
      }
    } catch {
      notifyProvider.error(t("webhooks.createError"));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("webhooks.confirmDelete"))) return;
    try {
      const response = await webhookService.deleteWebhook(id);
      if (response?.status === 200) {
        notifyProvider.success(t("webhooks.deleteSuccess"));
        loadWebhooks();
      } else {
        notifyProvider.error(t("webhooks.deleteError"));
      }
    } catch {
      notifyProvider.error(t("webhooks.deleteError"));
    }
  };

  const handleToggleActive = async (webhook: Webhook) => {
    try {
      const response = await webhookService.updateWebhook(webhook.id, {
        active: !webhook.active,
      });
      if (response?.status === 200) {
        notifyProvider.success(t("webhooks.updateSuccess"));
        loadWebhooks();
      }
    } catch {
      notifyProvider.error(t("webhooks.updateError"));
    }
  };

  const handleRegenerateSecret = async (id: number) => {
    if (!window.confirm(t("webhooks.confirmRegenerate"))) return;
    try {
      const response = await webhookService.regenerateWebhookSecret(id);
      if (response?.status === 200) {
        notifyProvider.success(t("webhooks.regenerateSuccess"));
        copyToClipboard(response.data.secret);
      }
    } catch {
      notifyProvider.error(t("webhooks.regenerateError"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifyProvider.success(t("webhooks.copied"));
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewWebhookUrl("");
    setNewWebhookEvents([]);
    setCreatedSecret(null);
  };

  const toggleEvent = (event: WebhookEvent) => {
    setNewWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const toggleExpanded = (webhookId: number) => {
    if (expandedWebhook === webhookId) {
      setExpandedWebhook(null);
      setDeliveries([]);
    } else {
      setExpandedWebhook(webhookId);
      loadDeliveries(webhookId);
    }
  };

  if (!currentOrganization || !isOwner) {
    return (
      <PainelContainer>
        <Card className="p-6">
          <p className="text-ink/60">{t("organization.accessDenied")}</p>
        </Card>
      </PainelContainer>
    );
  }

  const canCreateMore = webhookLimit === null || webhooks.length < webhookLimit;

  return (
    <PainelContainer>
      <LoadingOverlay show={loading} />
      <TitleContainer
        title={t("webhooks.title")}
        textHelp={t("webhooks.subtitle")}
      />

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">{t("webhooks.listTitle")}</h3>
            {webhookLimit !== null && (
              <p className="text-xs text-ink/50">
                {t("webhooks.limit", { current: webhooks.length, max: webhookLimit })}
              </p>
            )}
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            leadingIcon={<FiPlus />}
            disabled={!canCreateMore}
          >
            {t("webhooks.create")}
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <p className="text-sm text-ink/60">{t("webhooks.empty")}</p>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="rounded-xl border border-ink/10 bg-paper/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink break-all">{webhook.url}</span>
                      <Badge variant={webhook.active ? "success" : "neutral"}>
                        {webhook.active ? t("webhooks.active") : t("webhooks.inactive")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="neutral" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpanded(webhook.id)}
                      title={t("webhooks.viewDeliveries")}
                    >
                      {expandedWebhook === webhook.id ? <FiChevronUp /> : <FiChevronDown />}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleActive(webhook)}
                      title={webhook.active ? t("webhooks.disable") : t("webhooks.enable")}
                    >
                      {webhook.active ? t("webhooks.disable") : t("webhooks.enable")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleRegenerateSecret(webhook.id)}
                      title={t("webhooks.regenerate")}
                    >
                      <FiRefreshCw />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-500"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>

                {expandedWebhook === webhook.id && (
                  <div className="border-t border-ink/10 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-ink">
                      {t("webhooks.recentDeliveries")}
                    </h4>
                    {loadingDeliveries ? (
                      <p className="text-sm text-ink/50">{t("common.loading")}</p>
                    ) : deliveries.length === 0 ? (
                      <p className="text-sm text-ink/50">{t("webhooks.noDeliveries")}</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {deliveries.slice(0, 10).map((delivery) => (
                          <div
                            key={delivery.id}
                            className="flex items-center justify-between rounded-lg bg-ink/5 p-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  delivery.responseStatus && delivery.responseStatus < 300
                                    ? "success"
                                    : "neutral"
                                }
                              >
                                {delivery.responseStatus ?? "pending"}
                              </Badge>
                              <span className="text-ink/70">{delivery.event}</span>
                            </div>
                            <span className="text-xs text-ink/50">
                              {new Date(delivery.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showCreateModal} onClose={closeModal} className="max-w-md">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
              {t("webhooks.newWebhook")}
            </p>
            <h2 className="font-display text-xl text-ink">
              {createdSecret ? t("webhooks.webhookCreated") : t("webhooks.createTitle")}
            </h2>
          </div>

          {createdSecret ? (
            <div className="space-y-4">
              <p className="text-sm text-ink/70">{t("webhooks.copyWarning")}</p>
              <div className="flex items-center gap-2 rounded-lg bg-ink/5 p-3">
                <code className="flex-1 break-all text-sm text-ink">{createdSecret}</code>
                <Button variant="ghost" onClick={() => copyToClipboard(createdSecret)}>
                  <FiCopy />
                </Button>
              </div>
              <Button onClick={closeModal} className="w-full">
                {t("common.close")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label={t("webhooks.urlLabel")}>
                <Input
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  type="url"
                />
              </Field>

              <Field label={t("webhooks.eventsLabel")}>
                <div className="flex flex-wrap gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <button
                      key={event}
                      type="button"
                      onClick={() => toggleEvent(event)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                        newWebhookEvents.includes(event)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-ink/20 text-ink/60 hover:border-ink/40"
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={closeModal}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleCreate} isLoading={creating}>
                  {t("webhooks.create")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </PainelContainer>
  );
};

export default WebhookManagement;
