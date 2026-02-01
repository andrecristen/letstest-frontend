import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getOverviewProject } from '../../services/projectService';
import notifyProvider from '../../infra/notifyProvider';
import TitleContainer from '../../components/TitleContainer';
import PainelContainer from '../../components/PainelContainer';
import { ProjectData, getProjectSituationDescription, getProjectVisibilityDescription } from '../../models/ProjectData';
import LoadingOverlay from '../../components/LoadingOverlay';
import CustomizableTable, { CustomizableTableRows } from '../../components/CustomizableTable/CustomizableTable';
import { Operation } from '../../components/CustomizableTable/CustomizableRow';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Badge, Button, Card } from '../../ui';
import { useTranslation } from 'react-i18next';

const ProjectOverView: React.FC = () => {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const [project, setProject] = useState<ProjectData | null>(null);
    const [exporting, setExporting] = useState<boolean>(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const loadProject = useCallback(async () => {
        try {
            const response = await getOverviewProject(parseInt(projectId || '0'));
            setProject(response?.data);
        } catch (error) {
            notifyProvider.error(t('projectOverview.loadError'));
        }
    }, [projectId, t]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    const convertToCustomizableTableRows = (data: any): CustomizableTableRows[] => {
        return Object.values(data).map((item: any) => ({
            id: item.id,
            columns: item.columns,
            maxColumnCount: item.maxColumnCount,
            minColumnCount: item.minColumnCount,
        }));
    };

    const exportToPDF = async () => {
        setExporting(true);
        const input = exportRef.current;
        const button = buttonRef.current;
        if (input && button) {
            button.style.display = 'none';

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvas = await html2canvas(input, {
                scale: 2,
                scrollY: 0,
            });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('project_overview.pdf');
            button.style.display = 'block';  
            setExporting(false);
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
                <TitleContainer title={t('projectOverview.pageTitle')} />
                <LoadingOverlay show={!project?.id || exporting} />
                {project && (
                    <Card className="space-y-8 bg-paper/95 p-10" ref={exportRef}>
                        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-ink/10 pb-6">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                    {t('projectOverview.reportTitle')}
                                </p>
                                <h1 className="font-display text-3xl text-ink">{project.name}</h1>
                                <p className="text-sm text-ink/60">
                                    {t('projectOverview.issuedOn', { date: new Date().toLocaleDateString('pt-BR') })}
                                </p>
                            </div>
                            <Badge variant={getSituationVariant(project.situation)}>
                                {getProjectSituationDescription(project.situation)}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t('common.summary')}</p>
                                <p className="text-sm text-ink/70">{project.description}</p>
                            </div>
                            <div className="grid gap-4 rounded-2xl border border-ink/10 bg-sand/60 p-4 text-sm text-ink/70">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ink">{t('common.visibility')}</span>
                                    <span>{getProjectVisibilityDescription(project.visibility)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ink">{t('common.status')}</span>
                                    <span>{getProjectSituationDescription(project.situation)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ink">{t('common.creator')}</span>
                                    <span>{project.creator?.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ink">{t('common.contact')}</span>
                                    <span>{project.creator?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                                <h2 className="font-display text-2xl text-ink">{t('projectOverview.testScenariosTitle')}</h2>
                                <span className="text-sm text-ink/50">
                                    {t('projectOverview.total', { total: project.testScenarios?.length ?? 0 })}
                                </span>
                            </div>
                            {project.testScenarios?.map((scenario, index) => (
                                <Card key={scenario.id} className="space-y-4 bg-paper">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                                {t('projectOverview.scenarioLabel', { index: index + 1 })}
                                            </p>
                                            <h3 className="font-display text-lg text-ink">{scenario.name}</h3>
                                        </div>
                                    </div>
                                    {scenario.data && (
                                        <CustomizableTable
                                            projectId={project.id}
                                            operation={Operation.View}
                                            defaultRows={convertToCustomizableTableRows(scenario.data)}
                                            onChange={() => {}}
                                        />
                                    )}
                                    {scenario.testCases && scenario.testCases.map((testCase, testIndex) => (
                                        <Card key={testCase.id} className="space-y-3 bg-sand/60">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                                        {t('projectOverview.caseLabel', { index: testIndex + 1 })}
                                                    </p>
                                                    <h4 className="font-display text-base text-ink">{testCase.name}</h4>
                                                </div>
                                            </div>
                                            {testCase.data && (
                                                <CustomizableTable
                                                    projectId={project.id}
                                                    operation={Operation.View}
                                                    defaultRows={convertToCustomizableTableRows(testCase.data)}
                                                    onChange={() => {}}
                                                />
                                            )}
                                            {testCase.testExecutions && testCase.testExecutions.map((testExecution, execIndex) => (
                                                <Card key={testExecution.id} className="space-y-3 bg-paper/80">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                                        {t('projectOverview.executionLabel', { index: execIndex + 1, id: testExecution.id })}
                                                    </p>
                                                    {testExecution.data && (
                                                        <CustomizableTable
                                                            projectId={project.id}
                                                            operation={Operation.View}
                                                            defaultRows={convertToCustomizableTableRows(testExecution.data)}
                                                            onChange={() => {}}
                                                        />
                                                    )}
                                                </Card>
                                            ))}
                                        </Card>
                                    ))}
                                </Card>
                            ))}
                        </div>
                        <div className="border-t border-ink/10 pt-4">
                            <Button ref={buttonRef} onClick={exportToPDF} variant="outline">
                                {t('projectOverview.exportPdf')}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </PainelContainer>
    );
};

export default ProjectOverView;
