import React, { useMemo, useRef, useState, useEffect } from "react";
import { FiPlus, FiSettings, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ListLayout from "../../components/ListLayout";
import { Badge, Button, Card, Field, Input } from "../../ui";
import { useOrganization } from "../../contexts/OrganizationContext";
import { useConfig } from "../../contexts/ConfigContext";
import OrganizationForm from "./OrganizationForm";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import notifyProvider from "../../infra/notifyProvider";
import { usePageLoading } from "../../hooks/usePageLoading";

const OrganizationList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);
  const { organizations, refreshOrganizations, isLoading, switchOrganization } = useOrganization();
  const { billingEnabled } = useConfig();

  const [filters, setFilters] = useState({ search: "" });
  const [filterDraft, setFilterDraft] = useState(filters);
  const [switchingOrgId, setSwitchingOrgId] = useState<number | null>(null);

  useEffect(() => {
    refreshOrganizations();
  }, [refreshOrganizations]);

  const handleClickNewOrganization = () => {
    formDialogRef.current?.setData({});
    formDialogRef.current?.openDialog();
  };

  const applyFilters = () => {
    setFilters(filterDraft);
  };

  const clearFilters = () => {
    const reset = { search: "" };
    setFilterDraft(reset);
    setFilters(reset);
  };

  const filteredOrganizations = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    if (!search) return organizations;
    return organizations.filter((org) => org.name.toLowerCase().includes(search));
  }, [organizations, filters.search]);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "owner":
        return t("organization.roleOwner");
      case "admin":
        return t("organization.roleAdmin");
      default:
        return t("organization.roleMember");
    }
  };

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case "owner":
        return "success";
      case "admin":
        return "info";
      default:
        return "neutral";
    }
  };

  const handleNavigateWithSwitch = async (orgId: number | undefined, route: string) => {
    if (!orgId) return;
    setSwitchingOrgId(orgId);
    try {
      const success = await switchOrganization(orgId);
      if (!success) {
        notifyProvider.error(t("organization.switchError"));
        return;
      }
      navigate(route);
    } finally {
      setSwitchingOrgId(null);
    }
  };

  usePageLoading(isLoading);

  return (
    <ListLayout
      title={t("organization.listTitle")}
      textHelp={t("organization.listHelp")}
      actions={(
        <Button type="button" onClick={handleClickNewOrganization} leadingIcon={<FiPlus />}>
          {t("organization.createNew")}
        </Button>
      )}
      filters={(
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Field label={t("organization.searchLabel")}>
            <Input
              type="text"
              placeholder={t("organization.searchPlaceholder")}
              value={filterDraft.search}
              onChange={(event) =>
                setFilterDraft((prev) => ({ ...prev, search: event.target.value }))
              }
            />
          </Field>
        </div>
      )}
      onApplyFilters={applyFilters}
      onClearFilters={clearFilters}
      loading={isLoading}
      loadingMessage={t("organization.loadingList")}
      empty={filteredOrganizations.length === 0}
      emptyMessage={t("organization.emptyList")}
      footer={<OrganizationForm ref={formDialogRef} callbackSubmit={refreshOrganizations} />}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant={getRoleVariant(org.role)}>{getRoleLabel(org.role)}</Badge>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">#{org.id}</p>
                <h3 className="font-display text-lg text-ink">{org.name}</h3>
                <p className="text-sm text-ink/60">{org.slug}</p>
              </div>
            </div>
            {(org.role === "owner" || org.role === "admin") && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leadingIcon={<FiSettings />}
                  disabled={switchingOrgId === org.id}
                  onClick={() => handleNavigateWithSwitch(org.id, "/organization/settings")}
                >
                  {t("organization.settings")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leadingIcon={<FiUsers />}
                  disabled={switchingOrgId === org.id}
                  onClick={() => handleNavigateWithSwitch(org.id, "/organization/members")}
                >
                  {t("organization.members")}
                </Button>
              </div>
            )}
            {billingEnabled && org.plan ? (
              <div className="text-sm text-ink/60">
                <span className="text-xs uppercase tracking-[0.2em] text-ink/40">
                  {t("organization.plan")}
                </span>
                <div className="mt-1 capitalize">{org.plan}</div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </ListLayout>
  );
};

export default OrganizationList;
