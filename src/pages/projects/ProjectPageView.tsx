import React, { useEffect, useRef, useState } from 'react';
import { FiEdit, FiFilePlus, FiFileText, FiMonitor, FiUser, FiUserPlus } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../../assets/logo-transparente.png';
import { getProjectById } from '../../services/projectService';
import {
    getProjectSituationColor,
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

const ProjectPageView: React.FC = () => {
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
            notifyProvider.error('Erro ao carregar o projeto.');
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

    return (
        <PainelContainer>
            <TitleContainer title="Detalhes do Projeto" />
            <LoadingOverlay show={(!project?.id)} />
            {project ? (
                <div className="border rounded-lg overflow-hidden shadow-md bg-white">
                    <img src={logo} className="w-full h-40 object-cover" alt={project.name} />
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {project.name}{' '}
                            <span
                                className={`bg-${getProjectSituationColor(
                                    project.situation
                                )} text-white rounded-lg p-1`}
                            >
                                {getProjectSituationDescription(project.situation)}
                            </span>
                        </h2>
                        <p className="text-gray-600 my-4">{project.description}</p>
                        {project.creatorId == tokenProvider.getSessionUserId() ? (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleEditClick}
                                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                >
                                    <FiEdit className="inline-block w-5 h-5 mr-2" />
                                    Editar
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-60">
                    <span className="text-purple-600 text-xl">Carregando...</span>
                </div>
            )}

            <div className="container mx-auto my-10">
                <h2 className="text-4xl text-center font-bold mb-8 text-purple-600">Operações</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div
                        onClick={() => navigateTo('managers')}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                    >
                        <FiUserPlus className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                        <h3 className="text-center text-lg font-semibold text-purple-600">Gerentes</h3>
                    </div>

                    <div
                        onClick={() => navigateTo('testers')}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                    >
                        <FiUser className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                        <h3 className="text-center text-lg font-semibold text-purple-600">Testadores</h3>
                    </div>

                    <div
                        onClick={() => navigateTo('test-cases')}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                    >
                        <FiFileText className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                        <h3 className="text-center text-lg font-semibold text-purple-600">Casos de Teste</h3>
                    </div>

                    <div
                        onClick={() => navigateTo('templates')}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                    >
                        <FiFilePlus className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                        <h3 className="text-center text-lg font-semibold text-purple-600">Templates</h3>
                    </div>
                    <div
                        onClick={() => navigateTo('environments')}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                    >
                        <FiMonitor className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                        <h3 className="text-center text-lg font-semibold text-purple-600">Ambientes</h3>
                    </div>
                </div>
            </div>
            <ProjectForm ref={formDialogRef} callbackSubmit={loadProject} />
        </PainelContainer>
    );
};

export default ProjectPageView;