import React, { useMemo, useRef, useState } from "react";
import { FiEdit, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getMyProjects } from "../../services/projectService";
import { getProjectSituationDescription, getProjectVisibilityDescription, getProjectSituationList, getProjectVisibilityList } from "../../models/ProjectData";
import ListLayout from "../../components/ListLayout";
import ProjectForm from "./ProjectForm";
import { ProjectData } from "../../models/ProjectData";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import notifyProvider from "../../infra/notifyProvider";
import { Badge, Button, Card, Field, Input, Select } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { usePageLoading } from "../../hooks/usePageLoading";
import tokenProvider from "../../infra/tokenProvider";

const ProjectOwnerList: React.FC = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);
  const currentUserId = tokenProvider.getSessionUserId();

  const [filters, setFilters] = useState<{ search: string; situation: number | null; visibility: number | null }>({
    search: "",
    situation: null,
    visibility: null,
  });
  const [filterDraft, setFilterDraft] = useState(filters);

  const {
    items: projects,
    loading: loadingProjects,
    loadingInitial,
    loadingMore,
    hasNext,
    sentinelRef,
    reload,
  } = useInfiniteList<ProjectData>(
    async (page, limit) => {
      try {
        const response = await getMyProjects(page, limit, {
          search: filters.search || undefined,
          situation: filters.situation ?? undefined,
          visibility: filters.visibility ?? undefined,
        });
        return response?.data ?? null;
      } catch (error) {
        notifyProvider.error(t("projects.loadListError"));
        return null;
      }
    },
    [filters.search, filters.situation, filters.visibility],
  );

  const handleClickNewProject = () => {
    formDialogRef.current?.setData({});
    formDialogRef.current?.openDialog();
  };

  const handleClickManageProject = (event: React.MouseEvent, project: ProjectData) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/project/detail/${project.id}`);
  };

  const handleClickEditProject = (event: React.MouseEvent, project: ProjectData) => {
    event.preventDefault();
    event.stopPropagation();
    formDialogRef.current?.setData(project);
    formDialogRef.current?.openDialog();
  };

  const handleKeyCard = (event: React.KeyboardEvent<HTMLDivElement>, project: ProjectData) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClickManageProject(event as unknown as React.MouseEvent, project);
    }
  };

  const getSituationVariant = (situation: number) => {
    switch (situation) {
      case 1:
        return "info";
      case 2:
        return "success";
      case 3:
        return "danger";
      default:
        return "neutral";
    }
  };

  const filteredProjects = useMemo(() => {
    return (projects || []).filter((project) =>
      project.name.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [projects, filters.search]);

  const visibilityOptions: Array<{ name: string; id: number | null }> = [
    { name: t("common.all"), id: null },
    ...getProjectVisibilityList(),
  ];

  const applyFilters = () => {
    setFilters(filterDraft);
  };

  const clearFilters = () => {
    const reset = { search: "", situation: null, visibility: null };
    setFilterDraft(reset);
    setFilters(reset);
  };

  usePageLoading(loadingInitial);

  return (
    <ListLayout
      title={t("projects.ownerTitle")}
      textHelp={t("projects.ownerHelp")}
      actions={(
        <Button type="button" onClick={handleClickNewProject} leadingIcon={<FiPlus />}>
          {t("projects.createNew")}
        </Button>
      )}
      filters={(
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Field label={t("projects.searchLabel")}>
            <Input
              type="text"
              placeholder={t("projects.searchPlaceholder")}
              value={filterDraft.search}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, search: e.target.value }))}
            />
          </Field>
          <Field label={t("common.status")}>
            <Select
              value={filterDraft.situation ?? ""}
              onChange={(event) =>
                setFilterDraft((prev) => ({
                  ...prev,
                  situation: event.target.value ? parseInt(event.target.value, 10) : null,
                }))
              }
            >
              <option value="">{t("common.all")}</option>
              {getProjectSituationList().map((situation) => (
                <option key={`situation-${situation.id}`} value={situation.id ?? ""}>
                  {situation.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("common.visibility")}>
            <Select
              value={filterDraft.visibility ?? ""}
              onChange={(event) =>
                setFilterDraft((prev) => ({
                  ...prev,
                  visibility: event.target.value ? parseInt(event.target.value, 10) : null,
                }))
              }
            >
              {visibilityOptions.map((visibility) => (
                <option key={`visibility-${visibility.id ?? "all"}`} value={visibility.id ?? ""}>
                  {visibility.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      onApplyFilters={applyFilters}
      onClearFilters={clearFilters}
      loading={loadingInitial}
      loadingMessage={t("projects.loadingOwnerList")}
      loadingMore={loadingMore}
      empty={filteredProjects.length === 0}
      emptyMessage={t("projects.emptyOwnerList")}
      footer={(
        <>
          {hasNext ? <div ref={sentinelRef} /> : null}
          <ProjectForm ref={formDialogRef} callbackSubmit={reload} />
        </>
      )}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="relative cursor-pointer transition-transform hover:-translate-y-1"
            role="button"
            tabIndex={0}
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => handleKeyCard(event, project)}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => handleClickManageProject(event, project)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                {project.creatorId === currentUserId ? (
                  <Badge
                    variant="neutral"
                    className="border-violet-300/70 bg-violet-100/70 text-violet-700"
                  >
                    {t("projects.roleOwner")}
                  </Badge>
                ) : (
                  <Badge
                    variant="neutral"
                    className="border-slate-200 bg-slate-100 text-slate-700"
                  >
                    {t("projects.roleManager")}
                  </Badge>
                )}
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                  #{project.id}
                </p>
                <h3 className="font-display text-lg text-ink">
                  {project.name}
                </h3>
              </div>
              {project.creatorId === currentUserId ? (
                <button
                  type="button"
                  aria-label={t("projects.editAria")}
                  className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70 transition-colors hover:text-ink"
                  onClick={(event) => handleClickEditProject(event, project)}
                >
                  <FiEdit className="h-5 w-5" />
                </button>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink/60">
              <Badge variant={getSituationVariant(project.situation)}>
                {getProjectSituationDescription(project.situation)}
              </Badge>
              <span>{getProjectVisibilityDescription(project.visibility)}</span>
            </div>
            <p className="mt-4 text-sm text-ink/60">
              {project.description}
            </p>
          </Card>
        ))}
      </div>
    </ListLayout>
  );
}

export default ProjectOwnerList;
