import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apply } from '../../services/involvementService';
import logo from '../../assets/logo-transparente.png'
import { getPublicProjects } from '../../services/projectService';
import { getProjectSituationColor, getProjectSituationDescription } from '../../types/ProjectSituationEnum';
import PainelContainer from '../base/PainelContainer';
import { ProjectData } from '../../types/ProjectData';
import notifyService from '../../services/notifyService';
import { TitleContainer } from '../base/TitleContainer';

export const ProjectsPublicList = () => {

    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoadingProjects(true);
        const response = await getPublicProjects();
        setProjects(response?.data);
        setLoadingProjects(false);
    }

    const onClickApply = async (event: any, projectId?: number) => {
        event.preventDefault();
        event.stopPropagation();
        if (projectId) {
            const response = await apply(projectId);
            if (response?.status == 201) {
                notifyService.success("Solicitação de participação enviada");
                load();
            } else {
                if (response && response.data) {
                    notifyService.error(response.data);
                } else {
                    notifyService.error("Erro ao enviar solicitação, tente novamente");
                }
            }
        }
    }

    return (
        <PainelContainer>
            <TitleContainer title="Encontrar Projetos" />
            <div className="px-6 lg:px-8 mb-4">
                <div className="mx-auto mt-2 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {projects.length ? (
                        projects.map((project) => (
                            <article key={project.id} className="border rounded-lg p-2 border-purple-600 flex max-w-xl flex-col items-start justify-between">
                                <div className="flex items-center gap-x-4 text-xs">
                                    <a
                                        className={"bg-" + (getProjectSituationColor(project.situation) ?? "purple-500") + " text-white relative z-10 rounded-full px-3 py-1.5 font-medium"}
                                    >
                                        {getProjectSituationDescription(project.situation)}
                                    </a>
                                    {/* <time dateTime={project.datetime} className="text-gray-500">
                    {project.date}
                </time> */}
                                </div>
                                <div className="group relative">
                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                                        <a>
                                            <span className="absolute inset-0" />
                                            #{project.id} - {project.name}
                                        </a>
                                    </h3>
                                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{project.description}</p>
                                </div>
                                <div className="relative mt-8 flex items-center gap-x-4">
                                    <img src={logo} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                                    <div className="text-sm leading-6">
                                        <p className="font-semibold text-gray-900">
                                            <a>
                                                <span className="absolute inset-0" />
                                                #Criador {project.creatorId}
                                            </a>
                                        </p>
                                        {/* <p className="text-gray-600">Nome do criador</p> */}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(event) => onClickApply(event, project.id)}
                                    className="mt-4 w-full relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Solicitar Participação
                                </button>
                            </article>
                        ))
                    ) : (
                        <>
                            <div></div>
                            <div className="text-center text-lg m-20 text-purple-600">{loadingProjects ? "Carregando projetos..." : "Nenhum projeto encontrado"}</div>
                            <div></div>
                        </>
                    )}


                </div>
            </div>
        </PainelContainer >
    )

};