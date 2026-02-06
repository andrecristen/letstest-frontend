import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import { Button, Field, Input } from "../../ui";
import LoadingOverlay from "../../components/LoadingOverlay";
import notifyProvider from "../../infra/notifyProvider";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as organizationService from "../../services/organizationService";
import { addMember } from "../../services/involvementService";
import type { InvolvementTypeEnum } from "../../models/InvolvementData";

type ProjectMemberModalProps = {
  open: boolean;
  onClose: () => void;
  projectId: number;
  type: InvolvementTypeEnum;
  existingUserIds: number[];
  onAdded: () => void;
};

const ProjectMemberModal: React.FC<ProjectMemberModalProps> = ({
  open,
  onClose,
  projectId,
  type,
  existingUserIds,
  onAdded,
}) => {
  const { t } = useTranslation();
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open || !currentOrganization) return;
    setLoading(true);
    organizationService
      .getMembers(currentOrganization.id)
      .then((response) => {
        const data = response?.data?.members ?? [];
        const mapped = data.map((member: any) => ({
          id: member.userId,
          name: member.user?.name ?? member.user?.email ?? "",
          email: member.user?.email ?? "",
        }));
        setMembers(mapped);
      })
      .catch(() => notifyProvider.error(t("involvement.loadMembersError")))
      .finally(() => setLoading(false));
  }, [open, currentOrganization, t]);

  const availableMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members
      .filter((member) => !existingUserIds.includes(member.id))
      .filter((member) => {
        if (!term) return true;
        return (
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term)
        );
      });
  }, [members, existingUserIds, search]);

  const handleAdd = async (userId: number) => {
    try {
      const response = await addMember(projectId, userId, type);
      if (response?.status === 402) {
        return;
      }
      if (response?.status === 201 || response?.status === 200) {
        notifyProvider.success(t("involvement.addSuccess"));
        onAdded();
      } else {
        notifyProvider.error(t("involvement.addError"));
      }
    } catch {
      notifyProvider.error(t("involvement.addError"));
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <LoadingOverlay show={loading} />
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl text-ink">
            {t("involvement.addMemberTitle")}
          </h3>
          <p className="text-sm text-ink/60">
            {t("involvement.addMemberHelp")}
          </p>
        </div>

        <Field label={t("involvement.searchLabel")}>
          <Input
            type="text"
            placeholder={t("involvement.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>

        <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-ink/10 bg-paper/70 p-3">
          {availableMembers.length === 0 ? (
            <p className="text-sm text-ink/60">{t("involvement.emptyMembers")}</p>
          ) : (
            availableMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-paper px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{member.name}</p>
                  <p className="text-xs text-ink/60">{member.email}</p>
                </div>
                <Button size="sm" onClick={() => handleAdd(member.id)}>
                  {t("involvement.addAction")}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectMemberModal;
