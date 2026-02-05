import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTestProjects } from '../../services/projectService';
import { getProjectSituationDescription, getProjectVisibilityDescription } from '../../models/ProjectData';
import ListLayout from '../../components/ListLayout';
import { ProjectData } from '../../models/ProjectData';
import notifyProvider from '../../infra/notifyProvider';
import { Badge, Card, Field, Input } from '../../ui';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { usePageLoading } from '../../hooks/usePageLoading';

const ProjectTesterList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: projects,
        loading: loadingProjects,
        loadingInitial,
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
        return (projects || []).filter(
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

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("projects.testerTitle")}
            textHelp={t("projects.testerHelp")}
            filters={(
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
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t('projects.loadingOwnerList')}
            loadingMore={loadingMore}
            empty={filteredProjects.length === 0}
            emptyMessage={t('projects.emptyOwnerList')}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
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
                ))}
            </div>
        </ListLayout>
    );
}

export default ProjectTesterList;
