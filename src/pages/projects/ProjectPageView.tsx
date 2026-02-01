import React, { useEffect, useRef, useState } from 'react';
import { FiDownload, FiEdit, FiFilePlus, FiFileText, FiInbox, FiMonitor, FiMove, FiUser, FiUserPlus } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../../assets/logo-transparente.png';
import { getProjectById } from '../../services/projectService';
import {
    getProjectSituationDescription,
} from '../../models/ProjectData';
import notifyProvider from '../../infra/notifyProvider';
import TitleContainer from '../../components/TitleContainer';
import ProjectForm from './ProjectForm';
import { FormDialogBaseExtendsRef } from '../../components/FormDialogBase';
import PainelContainer from '../../components/PainelContainer';
import { ProjectData } from '../../models/ProjectData';
import LoadingOverlay from '../../components/LoadingOverlay';
import tokenProvider from '../../infra/tokenProvider';
import { Badge, Button, Card, cn } from '../../ui';
import { useTranslation } from 'react-i18next';

const ProjectPageView: React.FC = () => {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<ProjectData | null>(null);
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const response = await getProjectById(parseInt(projectId || '0'));
            setProject(response?.data);
        } catch (error) {
            notifyProvider.error(t('projects.loadError'));
        }
    };

    const handleEditClick = (event: React.MouseEvent) => {
        event.preventDefault();
        formDialogRef.current?.setData(project);
        formDialogRef.current?.openDialog();
    };

    const navigateTo = (route: string) => {
        if (project?.id) {
            navigate(`/project/${route}/${project.id}`);
        } else {
            notifyProvider.error('Projeto não identificado.');
        }
    };

    const getSituationVariant = (situation: number) => {
        switch (situation) {
            case 1:
                return "accent";
            case 2:
                return "success";
            case 3:
                return "danger";
            default:
                return "neutral";
        }
    };

    return (
        <PainelContainer>
            <div className="space-y-6">
                <TitleContainer title={t('projects.detailTitle')} />
                <LoadingOverlay show={(!project?.id)} />
                {project ? (
                    <Card className="overflow-hidden p-0">
                        <div className="h-40 w-full bg-gradient-to-r from-ocean/30 via-sand to-ember/30">
                            <img src={logo} className="h-full w-full object-contain p-6" alt={project.name} />
                        </div>
                        <div className="space-y-4 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                        Projeto
                                    </p>
                                    <h2 className="font-display text-2xl text-ink">
                                        {project.name}
                                    </h2>
                                </div>
                                <Badge variant={getSituationVariant(project.situation)}>
                                    {getProjectSituationDescription(project.situation)}
                                </Badge>
                            </div>
                            <p className="text-sm text-ink/60">{project.description}</p>
                            {project.creatorId == tokenProvider.getSessionUserId() ? (
                                <div className="flex justify-end">
                                    <Button onClick={handleEditClick} leadingIcon={<FiEdit />}>
                                        {t('common.edit')}
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </Card>
                ) : (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t('common.loading')}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-2xl text-ink">{t('projects.operationsTitle')}</h2>
                        <p className="text-sm text-ink/60">{t('projects.operationsSubtitle')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {[
                            { label: t('projects.managersLabel'), route: "managers", icon: <FiUserPlus /> },
                            { label: t('projects.testersLabel'), route: "testers", icon: <FiUser /> },
                            { label: t('projects.testScenariosLabel'), route: "test-scenarios", icon: <FiMove /> },
                            { label: t('projects.testCasesLabel'), route: "test-cases", icon: <FiFileText /> },
                            { label: t('projects.customFieldsLabel'), route: "tags", icon: <FiInbox /> },
                            { label: t('projects.templatesLabel'), route: "templates", icon: <FiFilePlus /> },
                            { label: t('projects.environmentsLabel'), route: "environments", icon: <FiMonitor /> },
                            { label: t('projects.overviewLabel'), route: "overview", icon: <FiDownload /> },
                        ].map((item) => (
                            <button
                                key={item.route}
                                type="button"
                                onClick={() => navigateTo(item.route)}
                                className={cn(
                                    "group rounded-2xl border border-ink/10 bg-paper/80 p-4 text-left transition-all hover:-translate-y-1 hover:border-ink/30"
                                )}
                                aria-label={t('common.openLabel', { label: item.label })}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xl text-ink/70 group-hover:text-ink">
                                        {item.icon}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-ink">{item.label}</h3>
                                <p className="mt-1 text-xs text-ink/50">{t('common.manage')}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <ProjectForm ref={formDialogRef} callbackSubmit={loadProject} />
            </div>
        </PainelContainer>
    );
};

export default ProjectPageView;
