import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../base/PainelContainer";
import {FiUser } from "react-icons/fi";
import notifyService from "../../services/notifyService";
import { TitleContainer } from "../base/TitleContainer";
import { TemplateData } from "../../types/TemplateData";


export const TemplateManagementList = () => {

    const navigate = useNavigate();
    let { projectId } = useParams();

    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);

    useEffect(() => {
        load();
    });

    const load = async () => {
        setLoadingTemplates(true);
    }

    const handleClickNewTemplate = () => {
        
    }

    return (
        <PainelContainer>
            <TitleContainer title="Templates" />
            <div className="my-4 px-2 flex justify-end items-stretch flex-wrap pb-0 bg-transparent">
                    <button
                        type="button"
                        className="py-2 px-12 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        onClick={handleClickNewTemplate}
                    >
                        Criar Novo
                    </button>
                </div>
            {templates.length ? (
                <ul className="divide-y divide-purple-200">
                    {templates.map((template) => (
                        <li key={template.id} className="py-4 flex">
                            <div className="flex-shrink-0">
                                <FiUser className="text-lg" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900">#: {template.id}</p>
                                <p className="text-sm text-purple-500">Nome: {template.name}</p>
                                <p className="text-sm text-purple-500">Descrição: {template.description}</p>
                                <p className="text-sm text-purple-500">Tipo: {template.type}</p>
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