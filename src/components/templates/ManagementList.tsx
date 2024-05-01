import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../base/PainelContainer";
import TitleContainer from "../base/TitleContainer";
import TemplateItem from "./Item";
import { TemplateData } from "../../types/TemplateData";
import { getAllByProject } from "../../services/templatesService";

const TemplateManagementList: React.FC = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadTemplates();
    }, [projectId]);
    
    const loadTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const response = await getAllByProject(parseInt(projectId || "0", 10));
            setTemplates(response?.data || []);
        } catch (error) {
            console.error("Erro ao carregar templates:", error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const filteredTemplates = templates.filter((template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNewTemplate = () => {
        navigate(`/project/templates/${projectId}/add`);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Templates" />

            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input mr-2"
                />
                <button
                    type="button"
                    className="py-2 px-8 text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 transition-colors"
                    onClick={handleNewTemplate}
                >
                    Criar Novo
                </button>
            </div>

            {loadingTemplates ? (
                <div className="text-center text-purple-600">Carregando templates do projeto...</div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center text-purple-600">Nenhum template encontrado</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredTemplates.map((template) => (
                        <TemplateItem
                            key={template.id}
                            template={template}
                            onDuplicate={() => navigate(`/project/templates/${projectId}/copy/${template.id}`)}
                            onView={() => navigate(`/project/templates/${projectId}/view/${template.id}`)}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TemplateManagementList;