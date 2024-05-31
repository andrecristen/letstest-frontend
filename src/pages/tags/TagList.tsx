import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import TagItem from "./TagItem";
import { TagData } from "../../models/TagData";
import { getTagsByProject } from "../../services/tagService";

const TagList: React.FC = () => {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const [tags, setTags] = useState<TagData[]>([]);
    const [loadingTags, setLoadingTags] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadTags();
    }, [projectId]);

    const loadTags = async () => {
        setLoadingTags(true);
        try {
            const response = await getTagsByProject(parseInt(projectId || "0", 10));
            setTags(response?.data || []);
        } catch (error) {
            console.error("Erro ao carregar tags:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNewTag = () => {
        navigate(`/project/tags/${projectId}/add`);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Campos Personalizados" />

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
                    onClick={handleNewTag}
                >
                    Criar Novo
                </button>
            </div>

            {loadingTags ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando campos personalizados do projeto...</div>
            ) : filteredTags.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhum campo personalizado encontrado</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredTags.map((tag) => (
                        <TagItem
                            key={tag.id}
                            tag={tag}
                            onView={() => navigate(`/project/tags/${projectId}/view/${tag.id}`)}
                            onEdit={() => navigate(`/project/tags/${projectId}/edit/${tag.id}`)}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TagList;