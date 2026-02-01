import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiFilter, FiUserPlus, FiXCircle } from "react-icons/fi";
import LoadingOverlay from "../../components/LoadingOverlay";
import { InvolvementTypeEnum } from "../../models/InvolvementData";
import { getDeviceTypeDescription, getDeviceTypeList } from "../../models/DeviceData";
import { getHabilityTypeDescription, getHabilityTypeList } from "../../models/HabilityData";
import { UserData } from "../../models/UserData";
import { invite } from "../../services/involvementService";
import { searchUsers } from "../../services/userService";
import notifyProvider from "../../infra/notifyProvider";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { Button, Field, Input, Modal, Select } from "../../ui";

type UserSearchResult = UserData & {
  habilities?: Array<{ id: number; type: number; value: string }>;
  devices?: Array<{ id: number; type: number; brand: string; model: string; system: string }>;
};

type InviteUserModalProps = {
  open: boolean;
  onClose: () => void;
  projectId: number;
  type: InvolvementTypeEnum;
  onInvited?: () => void;
};

const InviteUserModal: React.FC<InviteUserModalProps> = ({ open, onClose, projectId, type, onInvited }) => {
  const { t } = useTranslation();
  const [invitingUserId, setInvitingUserId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    hability: "",
    habilityType: null as number | null,
    deviceType: null as number | null,
    deviceBrand: "",
    deviceModel: "",
    deviceSystem: "",
  });

  const [filterDraft, setFilterDraft] = useState(filters);

  const dependencyKey = useMemo(
    () => [
      filters.search,
      filters.hability,
      filters.habilityType,
      filters.deviceType,
      filters.deviceBrand,
      filters.deviceModel,
      filters.deviceSystem,
      projectId,
      type,
    ],
    [filters, projectId, type]
  );

  const {
    items: users,
    loading,
    loadingMore,
    hasNext,
    sentinelRef,
    reload,
  } = useInfiniteList<UserSearchResult>(
    async (page, limit) => {
      try {
        const response = await searchUsers(
          {
            ...filters,
            excludeProjectId: projectId,
            excludeInvolvementType: type,
          },
          page,
          limit
        );
        return response?.data ?? null;
      } catch (error) {
        notifyProvider.error(t("involvement.inviteSearchError"));
        return null;
      }
    },
    dependencyKey,
    { enabled: open }
  );

  const applyFilters = () => {
    setFilters(filterDraft);
  };

  const clearFilters = () => {
    const reset = {
      search: "",
      hability: "",
      habilityType: null,
      deviceType: null,
      deviceBrand: "",
      deviceModel: "",
      deviceSystem: "",
    };
    setFilterDraft(reset);
    setFilters(reset);
  };

  const handleInvite = async (targetEmail: string, targetUserId?: number) => {
    if (!targetEmail.trim()) {
      notifyProvider.info(t("involvement.inviteMissingEmail"));
      return;
    }

    setInvitingUserId(targetUserId ?? null);

    try {
      const response = await invite(projectId, targetEmail, type);
      if (response?.status === 201) {
        notifyProvider.success(t("involvement.inviteSuccess"));
        onInvited?.();
        reload();
      } else {
        notifyProvider.error(t("involvement.inviteError"));
      }
    } catch (error) {
      notifyProvider.error(t("involvement.inviteError"));
    } finally {
      setInvitingUserId(null);
    }
  };

  return (
    <>
      <LoadingOverlay show={invitingUserId !== null} />
      <Modal open={open} onClose={onClose} className="my-6 max-w-screen-2xl w-full">
        <div className="flex max-h-screen flex-col space-y-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl text-ink">{t("involvement.inviteModalTitle")}</h3>
            <p className="text-sm text-ink/60">{t("involvement.inviteModalHelp")}</p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              <Field label={t("involvement.searchLabel")}>
                <Input
                  type="text"
                  value={filterDraft.search}
                  onChange={(event) => setFilterDraft((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder={t("involvement.searchPlaceholder")}
                />
              </Field>
              <Field label={t("involvement.habilityLabel")}>
                <Input
                  type="text"
                  value={filterDraft.hability}
                  onChange={(event) => setFilterDraft((prev) => ({ ...prev, hability: event.target.value }))}
                  placeholder={t("involvement.habilityPlaceholder")}
                />
              </Field>
              <Field label={t("involvement.habilityTypeLabel")}>
                <Select
                  value={filterDraft.habilityType ?? ""}
                  onChange={(event) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      habilityType: event.target.value ? parseInt(event.target.value, 10) : null,
                    }))
                  }
                >
                  <option value="">{t("common.all")}</option>
                  {getHabilityTypeList().map((option) => (
                    <option key={`hability-${option.id}`} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("involvement.deviceTypeLabel")}>
                <Select
                  value={filterDraft.deviceType ?? ""}
                  onChange={(event) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      deviceType: event.target.value ? parseInt(event.target.value, 10) : null,
                    }))
                  }
                >
                  <option value="">{t("common.all")}</option>
                  {getDeviceTypeList().map((option) => (
                    <option key={`device-${option.id}`} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("involvement.deviceBrandLabel")}>
                <Input
                  type="text"
                  value={filterDraft.deviceBrand}
                  onChange={(event) => setFilterDraft((prev) => ({ ...prev, deviceBrand: event.target.value }))}
                  placeholder={t("involvement.deviceBrandPlaceholder")}
                />
              </Field>
              <Field label={t("involvement.deviceModelLabel")}>
                <Input
                  type="text"
                  value={filterDraft.deviceModel}
                  onChange={(event) => setFilterDraft((prev) => ({ ...prev, deviceModel: event.target.value }))}
                  placeholder={t("involvement.deviceModelPlaceholder")}
                />
              </Field>
              <Field label={t("involvement.deviceSystemLabel")}>
                <Input
                  type="text"
                  value={filterDraft.deviceSystem}
                  onChange={(event) => setFilterDraft((prev) => ({ ...prev, deviceSystem: event.target.value }))}
                  placeholder={t("involvement.deviceSystemPlaceholder")}
                />
              </Field>
            </div>
            <div className="flex w-full justify-end gap-2 pt-2">
              <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                {t("common.confirm")}
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                {t("common.clearFilters")}
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col space-y-4">
            <div className="flex items-center justify-between text-sm text-ink/60">
              <span>{t("involvement.searchResults")}</span>
              {loading ? <span>{t("common.loading")}</span> : null}
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              {users.length === 0 && !loading ? (
                <div className="rounded-2xl border border-ink/10 bg-paper/70 p-6 text-center text-sm text-ink/60">
                  {t("involvement.emptySearch")}
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-2">
                      <div>
                        <p className="font-display text-lg text-ink">{user.name}</p>
                        <p className="text-sm text-ink/60">{user.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-ink/60">
                        {user.habilities?.slice(0, 3).map((hability) => (
                          <span key={`hab-${hability.id}`} className="rounded-full border border-ink/10 px-2 py-1">
                            {getHabilityTypeDescription(hability.type)} · {hability.value}
                          </span>
                        ))}
                        {user.devices?.slice(0, 2).map((device) => (
                          <span key={`dev-${device.id}`} className="rounded-full border border-ink/10 px-2 py-1">
                            {getDeviceTypeDescription(device.type)} · {device.brand} {device.model}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="accent"
                      leadingIcon={<FiUserPlus />}
                      onClick={() => handleInvite(user.email, user.id)}
                      disabled={invitingUserId === user.id}
                    >
                      {t("involvement.inviteButton")}
                    </Button>
                  </div>
                ))
              )}
              {loadingMore ? (
                <div className="text-center text-xs text-ink/50">{t("common.loading")}</div>
              ) : null}
              {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InviteUserModal;
