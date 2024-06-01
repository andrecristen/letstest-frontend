import React, { useEffect, useState } from 'react';
import { apply } from '../../services/involvementService';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-transparente.png';
import { getPublicProjects } from '../../services/projectService';
import { getProjectSituationColor, getProjectSituationDescription } from '../../models/ProjectData';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { ProjectData } from '../../models/ProjectData';
import notifyProvider from '../../infra/notifyProvider';

const ProjectPublicList: React.FC = () => {

    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoadingProjects(true);
        try {
            const response = await getPublicProjects();
            setProjects(response?.data ?? []);
        } catch (error) {
            notifyProvider.error('Erro ao carregar projetos');
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleApply = async (event: React.MouseEvent, projectId?: number) => {
        event.preventDefault();
        event.stopPropagation();
        if (projectId) {
            try {
                const response = await apply(projectId);
                if (response?.status === 201) {
                    notifyProvider.success("Solicitação de participação enviada");
                    loadProjects();
                } else {
                    notifyProvider.error("Erro ao enviar solicitação, tente novamente");
                }
            } catch {
                notifyProvider.error("Erro ao enviar solicitação, tente novamente");
            }
        }
    };

    const filteredProjects = projects.filter(
        (project) => project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickNewProject = () => {
        navigate("/my-owner-projects");
    }

    const handleClickInvolvements = () => {
        navigate("/involvements");
    }

    const handleClickProfileUser = (project: ProjectData) => {
        navigate("/profile/" + project.creator?.id);
    }

    return (
        <PainelContainer>
            <TitleContainer title="Encontrar Projetos" textHelp='Encontre projetos públicos e solicite a participação como testador'/>
            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    className="w-full py-2 px-8 text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 transition-colors"
                    onClick={handleClickNewProject}
                >
                    Criar Meu Projeto
                </button>
                <button
                    type="button"
                    className="w-full ml-2 py-2 px-8 text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 transition-colors"
                    onClick={handleClickInvolvements}
                >
                    Solicitações e Convites
                </button>
            </div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input mr-2 py-2 px-8 text-lg h-16"
                />
            </div>
            <div className="px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 pt-10 border-t border-gray-200 lg:max-w-none lg:grid-cols-3">
                    {loadingProjects ? (
                        <div className="text-center text-lg text-purple-600 my-20 col-span-3">Carregando seus projetos...</div>
                    ) : (
                        filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <article key={project.id} className="border rounded-lg p-2 border-purple-600 flex flex-col items-start justify-between bg-white shadow-md hover:shadow-xl transition-shadow">
                                    <div className="flex items-center gap-x-4 text-xs">
                                        <span
                                            className={`bg-${getProjectSituationColor(
                                                project.situation
                                            )} text-white relative z-10 rounded-full px-3 py-1.5 font-medium`}
                                        >
                                            {getProjectSituationDescription(project.situation)}
                                        </span>
                                    </div>
                                    <div className="group relative">
                                        <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                                            #{project.id} - {project.name}
                                        </h3>
                                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{project.description}</p>
                                    </div>
                                    <div className="relative mt-8 flex items-center gap-x-4">
                                        <img src={logo} alt="Logo" className="h-10 w-10 rounded-full bg-gray-50" />
                                        <div className="text-sm leading-6">
                                            <p className="font-semibold text-gray-900">
                                                <p className="font-semibold text-gray-900">
                                                    <a href="" className="border-b border-purple-400" onClick={() => { handleClickProfileUser(project) }}>Criador: {project.creator?.name}</a>
                                                </p>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(event) => handleApply(event, project.id)}
                                        className="mt-4 w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700"
                                    >
                                        Solicitar Participação
                                    </button>
                                </article>
                            ))
                        ) : (
                            <div className="text-center text-lg text-purple-600 m-20 col-span-3">Nenhum projeto encontrado</div>
                        )
                    )}
                </div>
            </div>
        </PainelContainer>
    );
};

export default ProjectPublicList;