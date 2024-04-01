import PainelContainer from "../base/PainelContainer";
import { FiActivity, FiEdit } from 'react-icons/fi';
import { getMyProjects } from '../../services/projectService';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo-transparente.png'

function ProjectsOwnerList() {

    const navigate = useNavigate();

    const [selectedSituation, setSelectedSituation] = useState(1);
    const [projects, setProjects] = useState([]);

    const formDialogRef = useRef(null);

    const situations = [
        { name: "Testando", id: 1 },
        { name: "Finalizado", id: 2 },
        { name: "Cancelado", id: 3 },
        { name: "Todos", id: null },
    ];

    const applications = [
        { name: "Web", id: 1 },
        { name: "Desktop", id: 2 },
        { name: "App", id: 3 },
        { name: "Híbrido", id: 4 },
    ];

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const response = await getMyProjects();
        setProjects(response?.data);
    }

    const handleClickNewProject = () => {

    }

    const handleClickManageProject = (event: any, project: any) => {
        event.preventDefault();
        event.stopPropagation();
        navigate('/painel/manage-project/' + project.id);
    }

    const handleClickEditProject = (event: any, project: any) => {
        event.preventDefault();
        event.stopPropagation();
    }

    return (
        <PainelContainer>
            <>
                <div className="my-4 px-2 flex justify-end items-stretch flex-wrap pb-0 bg-transparent">
                    <button
                        type="button"
                        className="py-2 px-12 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        onClick={handleClickNewProject}
                    >
                        Criar Novo
                    </button>
                </div>
                <ul className="w-full flex border-b mt-1">
                    {situations.map((situation: any) => (
                        <li onClick={() => { setSelectedSituation(situation.id) }} className="w-full -mb-px">
                            <a className={"w-full bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 " + (situation.id == selectedSituation ? "border-b-4 border-b-purple-400 text-purple-700 font-semibold" : "text-purple-600 hover:text-purple-600 hover:font-semibold")} href="#">{situation.name}</a>
                        </li>
                    ))}
                </ul>
                <div className="flex flex-wrap">
                    <div className="w-full max-w-full px-3 mb-6 mx-auto">
                        <div className="relative flex flex-col min-w-0 break-words bg-light/30">
                            <div className="flex-auto block p-2">
                                <div className="overflow-x-auto">
                                    <table className="table-auto w-full my-0 align-middle text-dark border">
                                        <thead className="bg-gray-300 border-b m-3">
                                            <tr className="text-secondary-dark">
                                                <th className="pb-3 pt-3 text-center w-1/3 min-w-[200px]">Projeto</th>
                                                <th className="pb-3 pt-3 text-center min-w-[80px]">Aplicação</th>
                                                <th className="pb-3 pt-3 text-center min-w-[80px]">Testado</th>
                                                <th className="pb-3 pt-3 text-center min-w-[80px]">Situação</th>
                                                <th className="pb-3 pt-3 text-center min-w-[80px]">Criado em</th>
                                                <th className="pb-3 pt-3 text-center min-w-[125px]">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="m-2">
                                            {projects.filter((currentProject: any) => (currentProject.situation == selectedSituation || selectedSituation == null)).map((project: any) => (
                                                <>
                                                    <tr className="border-b last:border-b-0 hover:bg-gray-200 cursor-pointer" onClick={(event) => { handleClickManageProject(event, project) }}>
                                                        <td className="p-3">
                                                            <div className="flex items-center">
                                                                <div className="relative inline-block shrink-0 rounded-2xl me-3">
                                                                    <img src={project.logo ? project.logo : logo} className="w-[50px] h-[50px] inline-block shrink-0 rounded-2xl" alt="" />
                                                                </div>
                                                                <div className="flex flex-col justify-start">
                                                                    <a href="javascript:void(0)" className="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary"> {project.name} </a>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span title={project.description} className='text-sm text-gray-500 line-clamp-2'>{project.description}</span>
                                                            </div>
                                                        </td>
                                                        <td className="pr-0 text-center">
                                                            <span className="font-semibold text-light-inverse text-md/normal"></span>
                                                        </td>
                                                        <td className="pr-0 text-center">
                                                            <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                                                                {project.percentage}%
                                                            </span>
                                                        </td>
                                                        <td className="pr-0 text-center">
                                                            <span className="text-center align-baseline inline-flex px-4 py-3 mr-auto items-center font-semibold text-[.95rem] leading-none text-primary bg-primary-light rounded-lg">
                                                                {project.situation}
                                                            </span>
                                                        </td>
                                                        <td className="pr-0 text-center">
                                                            <span className="font-semibold text-light-inverse text-md/normal">
                                                                {project.date}
                                                            </span>
                                                        </td>
                                                        <td className="pr-3 text-center">
                                                            <button onClick={(event) => { handleClickManageProject(event, project) }} title="Gerenciar" className="m-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700">
                                                                <span className="flex items-center justify-center p-2 leading-none shrink-0 ">
                                                                    <FiActivity className="w-6 h-6" />
                                                                </span>
                                                            </button>
                                                            <button onClick={(event) => { handleClickEditProject(event, project) }} title="Editar" className="m-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700">
                                                                <span className="flex items-center justify-center p-2 leading-none shrink-0 ">
                                                                    <FiEdit className="w-6 h-6" />
                                                                </span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </PainelContainer>
    );
}

export default ProjectsOwnerList;