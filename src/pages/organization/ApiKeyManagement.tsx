import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2, FiCopy, FiKey } from "react-icons/fi";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as apiKeyService from "../../services/apiKeyService";
import type { ApiKey, ApiKeyScope } from "../../services/apiKeyService";
import notifyProvider from "../../infra/notifyProvider";
import { requestConfirm } from "../../infra/confirmManager";
import { Button, Card, Field, Input, Badge } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import Modal from "../../ui/Modal";

const AVAILABLE_SCOPES: { key: ApiKeyScope; label: string }[] = [
  { key: "read", label: "Read" },
  { key: "write", label: "Write" },
  { key: "projects", label: "Projects" },
  { key: "test_cases", label: "Test Cases" },
  { key: "test_executions", label: "Test Executions" },
];

const ApiKeyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentOrganization, isOwner, switchOrganization } = useOrganization();

  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<ApiKeyScope[]>(["read"]);
  const [newKeyExpires, setNewKeyExpires] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const refreshAttemptedRef = useRef<Record<number, boolean>>({});

  const loadApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiKeyService.getApiKeys();
      if (response?.status === 200) {
        setApiKeys(response.data ?? []);
      } else if (response?.status === 403) {
        if (currentOrganization && !refreshAttemptedRef.current[currentOrganization.id]) {
          refreshAttemptedRef.current[currentOrganization.id] = true;
          await switchOrganization(currentOrganization.id);
          return;
        }
        notifyProvider.error(t("apiKeys.noAccess"));
      }
    } catch {
      notifyProvider.error(t("apiKeys.loadError"));
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, switchOrganization, t]);

  useEffect(() => {
    if (currentOrganization && isOwner) {
      loadApiKeys();
    }
  }, [currentOrganization, isOwner, loadApiKeys]);

  useEffect(() => {
    if (currentOrganization && !isOwner) {
      notifyProvider.error(t("organization.accessDenied"));
      navigate("/dashboard");
    }
  }, [currentOrganization, isOwner, navigate, t]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      notifyProvider.error(t("apiKeys.nameRequired"));
      return;
    }
    setCreating(true);
    try {
      const response = await apiKeyService.createApiKey({
        name: newKeyName,
        scopes: newKeyScopes,
        expiresAt: newKeyExpires || null,
      });
      if (response?.status === 201) {
        setCreatedKey(response.data.key);
        notifyProvider.success(t("apiKeys.createSuccess"));
        loadApiKeys();
      } else {
        notifyProvider.error(response?.data?.error || t("apiKeys.createError"));
      }
    } catch {
      notifyProvider.error(t("apiKeys.createError"));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await requestConfirm({
      message: t("apiKeys.confirmDelete"),
    });
    if (!confirmed) return;
    try {
      const response = await apiKeyService.deleteApiKey(id);
      if (response?.status === 200) {
        notifyProvider.success(t("apiKeys.deleteSuccess"));
        loadApiKeys();
      } else {
        notifyProvider.error(t("apiKeys.deleteError"));
      }
    } catch {
      notifyProvider.error(t("apiKeys.deleteError"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifyProvider.success(t("apiKeys.copied"));
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewKeyName("");
    setNewKeyScopes(["read"]);
    setNewKeyExpires("");
    setCreatedKey(null);
  };

  const toggleScope = (scope: ApiKeyScope) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
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

  return (
    <PainelContainer>
      <LoadingOverlay show={loading} />
      <TitleContainer
        title={t("apiKeys.title")}
        textHelp={t("apiKeys.subtitle")}
      />

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">{t("apiKeys.listTitle")}</h3>
          <Button onClick={() => setShowCreateModal(true)} leadingIcon={<FiPlus />}>
            {t("apiKeys.create")}
          </Button>
        </div>

        {apiKeys.length === 0 ? (
          <p className="text-sm text-ink/60">{t("apiKeys.empty")}</p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 bg-paper/70 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FiKey className="text-ink/40" />
                    <span className="font-medium text-ink">{apiKey.name}</span>
                    <code className="rounded bg-ink/5 px-2 py-0.5 text-xs text-ink/60">
                      {apiKey.keyPrefix}...
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.scopes.map((scope) => (
                      <Badge key={scope} variant="neutral" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-ink/50">
                    {apiKey.lastUsedAt
                      ? t("apiKeys.lastUsed", { date: new Date(apiKey.lastUsedAt).toLocaleDateString() })
                      : t("apiKeys.neverUsed")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(apiKey.id)}
                  className="text-red-500"
                >
                  <FiTrash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showCreateModal} onClose={closeModal} className="max-w-md">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
              {t("apiKeys.newKey")}
            </p>
            <h2 className="font-display text-xl text-ink">
              {createdKey ? t("apiKeys.keyCreated") : t("apiKeys.createTitle")}
            </h2>
          </div>

          {createdKey ? (
            <div className="space-y-4">
              <p className="text-sm text-ink/70">{t("apiKeys.copyWarning")}</p>
              <div className="flex items-center gap-2 rounded-lg bg-ink/5 p-3">
                <code className="flex-1 break-all text-sm text-ink">{createdKey}</code>
                <Button variant="ghost" onClick={() => copyToClipboard(createdKey)}>
                  <FiCopy />
                </Button>
              </div>
              <Button onClick={closeModal} className="w-full">
                {t("common.close")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label={t("apiKeys.nameLabel")}>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t("apiKeys.namePlaceholder")}
                />
              </Field>

              <Field label={t("apiKeys.scopesLabel")}>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <button
                      key={scope.key}
                      type="button"
                      onClick={() => toggleScope(scope.key)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        newKeyScopes.includes(scope.key)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-ink/20 text-ink/60 hover:border-ink/40"
                      }`}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t("apiKeys.expiresLabel")}>
                <Input
                  type="date"
                  value={newKeyExpires}
                  onChange={(e) => setNewKeyExpires(e.target.value)}
                />
                <p className="mt-1 text-xs text-ink/50">{t("apiKeys.expiresHint")}</p>
              </Field>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={closeModal}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleCreate} isLoading={creating}>
                  {t("apiKeys.create")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </PainelContainer>
  );
};

export default ApiKeyManagement;
