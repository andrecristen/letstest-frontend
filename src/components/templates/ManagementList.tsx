import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../base/PainelContainer";
import { FiCopy, FiFileText, FiLink, FiTerminal, FiUser } from "react-icons/fi";
import notifyService from "../../services/notifyService";
import { TitleContainer } from "../base/TitleContainer";
import { TemplateData, getTemplateTypeDescription } from "../../types/TemplateData";
import { getAllByProject } from "../../services/templatesService";


const TemplateManagementList = () => {

    const navigate = useNavigate();
    let { projectId } = useParams();

    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoadingTemplates(true);
        const response = await getAllByProject(parseInt(projectId ? projectId : "0"));
        setTemplates(response?.data);
        setLoadingTemplates(false);
    }

    const handleClickNewTemplate = () => {
        navigate("/project/templates/" + projectId + "/add");
    }

    const handleClickDuplicate = (templateId: number) => {
        navigate("/project/templates/" + projectId + "/copy/" + templateId);
    }

    return (
        <PainelContainer>
            <TitleContainer title="Templates" />
            <div className="my-4 px-2 flex justify-end items-stretch flex-wrap pb-0 bg-transparent">
                <button
                    type="button"
                    className="py-2 px-12 border border-transparent text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={handleClickNewTemplate}
                >
                    Criar Novo
                </button>
            </div>
            {templates.length ? (
                <ul className="divide-y border border-gray-300 rounded-lg">
                    {templates.map((template, index) => (
                        <li key={template.id} className={`p-6 flex ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                            <div className="flex-shrink-0">
                                <FiFileText className="text-lg" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900"># {template.id}</p>
                                <p className="font-bold text-lg text-purple-700">{template.name}</p>
                                <p className="font-bold text-sm text-purple-500">{getTemplateTypeDescription(template.type)}</p>
                                <p className="text-sm text-gray-500 line-clamp-6"> {template.description}</p>
                            </div>
                            <div className="ml-auto flex">
                                <button onClick={() => { handleClickDuplicate(template.id) }} className="h-8 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <FiCopy className="h-5 w-5 mr-2" /> Personalizar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-lg m-20 text-purple-600">{loadingTemplates ? "Carregando templates do projeto..." : "Nenhum template encontrado"}</div>
            )}
        </PainelContainer>
    );
}

export default TemplateManagementList;