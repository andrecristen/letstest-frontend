import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const ProjectOverView: React.FC = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<ProjectData | null>(null);
    const [exporting, setExporting] = useState<boolean>(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const response = await getOverviewProject(parseInt(projectId || '0'));
            setProject(response?.data);
        } catch (error) {
            notifyProvider.error('Erro ao carregar o projeto.');
        }
    };

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

    return (
        <PainelContainer>
            <TitleContainer title="Visão Geral" />
            <LoadingOverlay show={!project?.id || exporting} />
            {project && (
                <div className="p-6 bg-white shadow-md rounded-md" ref={exportRef}>
                    <h1 className="text-3xl font-semibold mb-6">Detalhes do Projeto</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <p className="text-lg font-semibold">Nome:</p>
                            <p className="text-gray-700">{project.name}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-lg font-semibold">Descrição:</p>
                            <p className="text-gray-700">{project.description}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-lg font-semibold">Visibilidade:</p>
                            <p className="text-gray-700">{getProjectVisibilityDescription(project.visibility)}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-lg font-semibold">Situação:</p>
                            <p className="text-gray-700">{getProjectSituationDescription(project.situation)}</p>
                        </div>
                        <div className="mb-4 col-span-2">
                            <p className="text-lg font-semibold">Criador:</p>
                            <p className="text-gray-700">{project.creator?.name} ({project.creator?.email})</p>
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold mt-10 mb-4">Cenários de Teste</h1>
                    {project.testScenarios?.map((scenario) => (
                        <div key={scenario.id} className="mb-6">
                            <h2 className="font-semibold text-xl mb-2">{scenario.name}</h2>
                            <hr className="mb-4"/>
                            {scenario.data && (
                                <CustomizableTable
                                    projectId={project.id}
                                    operation={Operation.View}
                                    defaultRows={convertToCustomizableTableRows(scenario.data)}
                                    onChange={() => {}}
                                />
                            )}
                            {scenario.testCases && scenario.testCases.map((testCase) => (
                                <div key={testCase.id} className="mt-4">
                                    <h3 className="font-semibold text-lg mb-2">{testCase.name}</h3>
                                    {testCase.data && (
                                        <CustomizableTable
                                            projectId={project.id}
                                            operation={Operation.View}
                                            defaultRows={convertToCustomizableTableRows(testCase.data)}
                                            onChange={() => {}}
                                        />
                                    )}
                                    {testCase.testExecutions && testCase.testExecutions.map((testExecution) => (
                                        <div key={testExecution.id} className="my-4">
                                            <h4 className="font-semibold text-md mb-2">Execução</h4>
                                            {testExecution.data && (
                                                <CustomizableTable
                                                    projectId={project.id}
                                                    operation={Operation.View}
                                                    defaultRows={convertToCustomizableTableRows(testExecution.data)}
                                                    onChange={() => {}}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                    <button ref={buttonRef} onClick={exportToPDF} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">Exportar como PDF</button>
                </div>
            )}
        </PainelContainer>
    );
};

export default ProjectOverView;