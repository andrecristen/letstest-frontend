import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTestProjects } from '../../services/projectService';
import { getProjectSituationDescription, getProjectVisibilityDescription, getProjectSituationColor } from '../../models/ProjectData';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { ProjectData } from '../../models/ProjectData';

const ProjectTesterList: React.FC = () => {

    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoadingProjects(true);
        try {
            const response = await getTestProjects();
            setProjects(response?.data || []);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleClickTestProject = (event: React.MouseEvent, project: ProjectData) => {
        event.preventDefault();
        event.stopPropagation();
        navigate(`/project/test/${project.id}`);
    };

    const filteredProjects = projects.filter(
        (project) => project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PainelContainer>
            <TitleContainer title="Testar Projetos" />

            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input mr-2 py-2 px-8 text-lg h-16"
                />
            </div>

            {loadingProjects ? (
                <div className="text-center text-lg text-purple-600 my-20">Carregando seus projetos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 cursor-pointer"
                                onClick={(event) => handleClickTestProject(event, project)}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-purple-700">#{project.id} - {project.name}</h3>
                                </div>
                                <div className="text-sm text-gray-600"><span
                                    className={`bg-${getProjectSituationColor(
                                        project.situation
                                    )} text-white rounded-lg p-1`}
                                >
                                    {getProjectSituationDescription(project.situation)}
                                </span> {getProjectVisibilityDescription(project.visibility)}</div>
                                <p title={project.description} className="text-gray-600 my-2 line-clamp-3 overflow-hidden text-ellipsis">{project.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-lg text-purple-600 col-span-full">Nenhum projeto encontrado</div>
                    )}
                </div>
            )}
        </PainelContainer>
    );
}

export default ProjectTesterList;