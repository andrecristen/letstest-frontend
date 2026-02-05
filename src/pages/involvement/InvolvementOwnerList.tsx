import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUser, FiUserPlus, FiTrash, FiEye } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { getByProject, remove } from "../../services/involvementService";
import { InvolvementData, InvolvementTypeEnum } from "../../models/InvolvementData";
import ListLayout from "../../components/ListLayout";
import ProjectMemberModal from "./ProjectMemberModal";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input } from "../../ui";
import { usePageLoading } from "../../hooks/usePageLoading";

interface InvolvementManagementListProps {
  type: InvolvementTypeEnum;
  title: string;
}

const InvolvementOwnerList: React.FC<InvolvementManagementListProps> = ({ type, title }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDraft, setFilterDraft] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);

  const {
    items: involvements,
    loadingInitial,
    loadingMore,
    hasNext,
    sentinelRef,
    reload,
  } = useInfiniteList<InvolvementData>(
    async (page, limit) => {
      try {
        const response = await getByProject(parseInt(projectId || "0", 10), page, limit, {
          search: searchTerm,
          type,
        });
        return response?.data ?? null;
      } catch {
        notifyProvider.error(t("involvement.ownerLoadError"));
        return null;
      }
    },
    [searchTerm, type, projectId],
    { enabled: Boolean(projectId) }
  );

  const applyFilters = () => {
    setSearchTerm(filterDraft);
  };

  const clearFilters = () => {
    setFilterDraft("");
    setSearchTerm("");
  };

  const handleRemove = async (involvement: InvolvementData) => {
    await remove(involvement.id);
    reload();
  };

  const handleView = async (involvement: InvolvementData) => {
    navigate("/profile/" + involvement.user?.id);
  };

  usePageLoading(loadingInitial);

  return (
    <ListLayout
      title={title}
      actions={(
        <Button type="button" variant="primary" leadingIcon={<FiUserPlus />} onClick={() => setAddOpen(true)}>
          {t("involvement.addMember")}
        </Button>
      )}
      filters={(
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Field label={t("involvement.searchLabel")}>
            <Input
              type="text"
              placeholder={t("involvement.searchPlaceholder")}
              value={filterDraft}
              onChange={(event) => setFilterDraft(event.target.value)}
            />
          </Field>
        </div>
      )}
      onApplyFilters={applyFilters}
      onClearFilters={clearFilters}
      loading={loadingInitial}
      loadingMessage={t("involvement.loadingList")}
      loadingMore={loadingMore}
      empty={involvements.length === 0}
      emptyMessage={t("involvement.emptyList")}
      footer={(
        <>
          {hasNext ? <div ref={sentinelRef} /> : null}
          {projectId ? (
            <ProjectMemberModal
              open={addOpen}
              onClose={() => setAddOpen(false)}
              projectId={parseInt(projectId, 10)}
              type={type}
              existingUserIds={involvements.map((item) => item.userId)}
              onAdded={reload}
            />
          ) : null}
        </>
      )}
    >
      <div className="grid grid-cols-1 gap-6">
        {involvements.map((involvement) => (
          <Card key={involvement.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                <FiUser className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg text-ink">{involvement.user?.name}</p>
                <p className="text-sm text-ink/60">{involvement.user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(involvement)}
                leadingIcon={<FiEye />}
              >
                {t("involvement.viewProfile")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemove(involvement)}
                leadingIcon={<FiTrash />}
              >
                {t("common.remove")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ListLayout>
  );
};

export default InvolvementOwnerList;
