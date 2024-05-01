import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../base/PainelContainer";
import { FiCopy, FiFileText, FiEye } from "react-icons/fi";
import TitleContainer from "../base/TitleContainer";
import { TemplateData, getTemplateTypeDescription } from "../../types/TemplateData";
import { getAllByProject } from "../../services/templatesService";

const TemplateManagementList: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);

  useEffect(() => {
    loadTemplates();
  }, []);

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

  const handleNewTemplate = () => {
    navigate(`/project/templates/${projectId}/add`);
  };

  const handleDuplicateTemplate = (templateId: number) => {
    navigate(`/project/templates/${projectId}/copy/${templateId}`);
  };

  const handleViewTemplate = (templateId: number) => {
    navigate(`/project/templates/${projectId}/view/${templateId}`);
  };

  return (
    <PainelContainer>
      <TitleContainer title="Templates" />

      <div className="flex justify-end mb-4">
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
      ) : templates.length === 0 ? (
        <div className="text-center text-purple-600">Nenhum template encontrado</div>
      ) : (
        <div className="grid grid-cols-1 md/grid-cols-2 lg/grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex justify-between items-center"
            >
              <div className="flex items-center">
                <FiFileText className="text-purple-700 w-6 h-6" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900"># {template.id}</p>
                  <p className="font-bold text-lg text-purple-700">{template.name}</p>
                  <p className="font-bold text-sm text-gray-500">{getTemplateTypeDescription(template.type)}</p>
                  <p className="text-sm text-gray-500 line-clamp-3">{template.description}</p>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                <button
                  onClick={() => handleDuplicateTemplate(template.id)}
                  className="inline-flex items-center w-40 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors mb-2"
                >
                  <FiCopy className="w-5 h-5 mr-2" /> Personalizar
                </button>
                <button
                  onClick={() => handleViewTemplate(template.id)}
                  className="inline-flex items-center w-40 px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors"
                >
                  <FiEye className="w-5 h-5 mr-2" /> Visualizar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PainelContainer>
  );
};

export default TemplateManagementList;