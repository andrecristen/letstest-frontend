import PainelContainer from "../base/PainelContainer";
import { FiEdit, FiFilePlus, FiFileText, FiPieChart, FiSmartphone, FiTrello, FiUser, FiUserPlus } from 'react-icons/fi';
import { getProjectById } from '../../services/projectService';
import { getProjectSituationColor, getProjectSituationDescription } from '../../types/ProjectSituationEnum';
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from '../../assets/logo-transparente.png'
import { ProjectData } from "../../types/ProjectData";
import notifyService from '../../services/notifyService';
import ProjectsForm from "./Form";
import { FormDialogBaseExtendsRef } from "../base/FormDialogBase";
import  TitleContainer from "../base/TitleContainer";

const ProjectsDetailView = () => {

    let { projectId } = useParams();

    const [project, setProject] = useState<ProjectData | null>(null);
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    const navigateToRoute = (route: string) => {
        if (project?.id) {
            navigate("/project/" + route + "/" + project.id);
        } else {
            notifyService.error("Projeto não identificado.");
        }
    }

    const load = async () => {
        const response = await getProjectById(parseInt(projectId ? projectId : "0"));
        setProject(response?.data);
    }

    const callListTesters = () => navigateToRoute("testers");
    const callListTemplates = () => navigateToRoute("templates");
    const callListManagers = () => navigateToRoute("managers");
    const callListTestCases = () => navigateToRoute("test-cases");
    const callListEnvironments = () => navigateToRoute("environments");
    const callListKanban = () => navigateToRoute("kanban");
    const callListDashboard = () => navigateToRoute("dashboard");

    const onClickEdit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        formDialogRef.current?.setData(project);
        formDialogRef.current?.getDialogBase().current.openDialog();
    }

    return (
        <PainelContainer>
            <TitleContainer title="Detalhes do Projeto"/>
            {project ? (
                <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
                    <img src={logo} className="w-full h-40 object-cover object-center" alt={project.name} />
                    <div className="p-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.name} <span className={"bg-" + (getProjectSituationColor(project.situation) ?? "purple-500") + " text-white rounded-lg p-2 text-xs"} >{getProjectSituationDescription(project.situation)}</span></h2>
                        <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                        {/* @todo outras informações projeto */}
                        <div className="flex justify-end">
                            <button
                                onClick={(event) => onClickEdit(event)}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700"
                            >
                                <span className="flex items-center justify-center mr-2">
                                    <FiEdit className="w-4 h-4" />
                                </span>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-lg m-20 text-purple-600">Carregando informações do projeto...</div>
            )}
            <div className="container mx-auto my-10">
                <h2 className="text-4xl text-center font-bold mb-8 text-purple-600">
                    Operações
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                    <div onClick={callListManagers} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiUserPlus className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Gerentes</h3>
                    </div>
                    <div onClick={callListTesters} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiUser className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Testadores</h3>
                    </div>
                    <div onClick={callListTestCases} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiFileText className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Casos de Teste</h3>
                    </div>
                    <div onClick={callListTemplates} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiFilePlus className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Templates</h3>
                    </div>
                    {/* <div onClick={callListKanban} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiTrello className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Kanban</h3>
                    </div>
                    <div onClick={callListEnvironments} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiSmartphone className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Ambientes</h3>
                    </div>
                    <div onClick={callListDashboard} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-500 cursor-pointer border border-purple-500">
                        <FiPieChart className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-semibold mb-2 text-purple-600">Dashboard</h3>
                    </div> */}
                </div>
            </div>
            <ProjectsForm ref={formDialogRef} />
        </PainelContainer>
    );
}

export default ProjectsDetailView;