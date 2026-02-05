import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTestProjects } from '../../services/projectService';
import { getProjectSituationDescription, getProjectVisibilityDescription } from '../../models/ProjectData';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { ProjectData } from '../../models/ProjectData';
import notifyProvider from '../../infra/notifyProvider';
import { Badge, Button, Card, Field, Input } from '../../ui';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import LoadingOverlay from '../../components/LoadingOverlay';
import { FiFilter, FiXCircle } from "react-icons/fi";

const ProjectTesterList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: projects,
        loading: loadingProjects,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<ProjectData>(
        async (page, limit) => {
            try {
                const response = await getTestProjects(page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t('projects.loadListError'));
                return null;
            }
        },
        []
    );

    const handleClickTestProject = (event: React.MouseEvent, project: ProjectData) => {
        event.preventDefault();
        event.stopPropagation();
        navigate(`/project/test/${project.id}`);
    };

    const handleKeyCard = (event: React.KeyboardEvent<HTMLDivElement>, project: ProjectData) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClickTestProject(event as unknown as React.MouseEvent, project);
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
        return projects.filter(
            (project) => project.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const applyFilters = () => {
        setSearchTerm(filterDraft);
    };

    const clearFilters = () => {
        setFilterDraft('');
        setSearchTerm('');
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
            <TitleContainer title={t("projects.testerTitle")} textHelp={t("projects.testerHelp")} />

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        <Field label={t('projects.searchLabel')}>
                            <Input
                                type="text"
                                placeholder={t('projects.searchPlaceholder')}
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

                {loadingProjects ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t('projects.loadingOwnerList')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="cursor-pointer transition-transform hover:-translate-y-1"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => handleKeyCard(event, project)}
                                    onClick={(event: React.MouseEvent<HTMLDivElement>) => handleClickTestProject(event, project)}
                                >
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                            #{project.id}
                                        </p>
                                        <h3 className="font-display text-lg text-ink">
                                            {project.name}
                                        </h3>
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
                            ))
                        ) : (
                            <div className="col-span-full rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                                {t('projects.emptyOwnerList')}
                            </div>
                        )}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
}

export default ProjectTesterList;
