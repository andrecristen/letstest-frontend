import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apply } from "../../services/involvementService";
import { getPublicProjects } from "../../services/projectService";
import {
  getProjectSituationDescription,
  ProjectData,
} from "../../models/ProjectData";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import notifyProvider from "../../infra/notifyProvider";
import logo from "../../assets/logo-transparente.png";
import { Badge, Button, Card, Field, Input } from "../../ui";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiPlus, FiXCircle } from "react-icons/fi";

const ProjectPublicList: React.FC = () => {
  const { t } = useTranslation();
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDraft, setFilterDraft] = useState(searchTerm);
  const navigate = useNavigate();
  const {
    items: projects,
    loading,
    loadingMore,
    hasNext,
    sentinelRef,
    reload,
  } = useInfiniteList<ProjectData>(
    async (page, limit) => {
      try {
        setLoadingProjects(true);
        const response = await getPublicProjects(page, limit);
        return response?.data ?? null;
      } catch (error) {
        notifyProvider.error(t("projects.public.loadError"));
        return null;
      } finally {
        setLoadingProjects(false);
      }
    },
    []
  );

  const handleApply = async (event: React.MouseEvent, projectId?: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (!projectId) return;
    try {
      const response = await apply(projectId);
      if (response?.status === 201) {
        notifyProvider.success(t("projects.public.applySuccess"));
        reload();
      } else {
        notifyProvider.error(t("projects.public.applyError"));
      }
    } catch {
      notifyProvider.error(t("projects.public.applyError"));
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const handleClickProfileUser = (project: ProjectData) => {
    navigate(`/profile/${project.creator?.id}`);
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

  const applyFilters = () => {
    setSearchTerm(filterDraft);
  };

  const clearFilters = () => {
    setFilterDraft("");
    setSearchTerm("");
  };

  return (
    <PainelContainer>
      <LoadingOverlay show={loadingMore} />
      <div className="space-y-6">
        <TitleContainer
          title={t("projects.public.title")}
          textHelp={t("projects.public.help")}
        />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate("/my-owner-projects")}
            leadingIcon={<FiPlus />}
          >
            {t("projects.public.createProject")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/involvements/invitations")}
          >
            {t("projects.public.invitations")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/involvements/requests")}
          >
            {t("projects.public.requests")}
          </Button>
        </div>

        <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <Field label={t("projects.public.searchPlaceholder")}>
              <Input
                type="text"
                placeholder={t("projects.public.searchPlaceholder")}
                value={filterDraft}
                onChange={(e) => setFilterDraft(e.target.value)}
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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading || loadingProjects ? (
            <div className="col-span-full rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
              {t("projects.public.loading")}
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card key={project.id} className="flex h-full flex-col gap-5">
                <div className="flex items-center justify-between">
                  <Badge variant={getSituationVariant(project.situation)}>
                    {getProjectSituationDescription(project.situation)}
                  </Badge>
                  <span className="text-xs text-ink/50">#{project.id}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg text-ink">
                    {project.name}
                  </h3>
                  <p className="text-sm text-ink/60">
                    {project.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleClickProfileUser(project)}
                  className="flex items-center gap-3 text-left"
                >
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-10 w-10 rounded-full border border-ink/10 bg-paper"
                  />
                  <div className="text-sm text-ink/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                      {t("projects.public.creatorLabel")}
                    </p>
                    <p className="font-semibold text-ink">
                      {project.creator?.name}
                    </p>
                  </div>
                </button>
                <Button
                  type="button"
                  variant="accent"
                  onClick={(event) => handleApply(event, project.id)}
                  className="mt-auto w-full"
                >
                  {t("projects.public.apply")}
                </Button>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
              {t("projects.public.empty")}
            </div>
          )}
        </div>
        {hasNext ? <div ref={sentinelRef} /> : null}
      </div>
    </PainelContainer>
  );
};

export default ProjectPublicList;
