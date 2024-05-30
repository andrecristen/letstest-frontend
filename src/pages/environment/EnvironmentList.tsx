import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnvironmentItem from "./EnvironmentItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { EnvironmentData } from "../../models/EnvironmentData";
import { getAllByProjects } from "../../services/environmentService";
import EnvironmentForm from "./EnvironmentForm";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";

const EnvironmentList: React.FC = () => {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const [environments, setEnvironments] = useState<EnvironmentData[]>([]);
    const [loadingEnvironments, setLoadingEnvironments] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

    useEffect(() => {
        loadEnvironments();
    }, []);

    const getProjectId = () => {
        return parseInt(projectId || "0", 10);
    }

    const loadEnvironments = async () => {
        setLoadingEnvironments(true);
        try {
            const response = await getAllByProjects(getProjectId());
            setEnvironments(response?.data || []);
        } catch (error) {
            console.error("Erro ao carregar ambiente de teste:", error);
        } finally {
            setLoadingEnvironments(false);
        }
    };

    const filteredEnvironments = environments.filter((environment) =>
        environment.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickNewEnvironment = () => {
        formDialogRef.current?.setData({});
        formDialogRef.current?.openDialog();
    };

    const handleClickEnvironment = (environment: EnvironmentData) => {
        formDialogRef.current?.setData(environment);
        formDialogRef.current?.openDialog();
    };

    return (
        <PainelContainer>
            <TitleContainer title="Ambientes de Teste" />
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
                    onClick={handleClickNewEnvironment}
                >
                    Criar Novo
                </button>
            </div>
            {loadingEnvironments ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando ambientes de teste do projeto...</div>
            ) : filteredEnvironments.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhum ambiente de teste encontrado</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredEnvironments.map((environment) => (
                        <EnvironmentItem
                            key={environment.id}
                            environment={environment}
                            onEdit={() => handleClickEnvironment(environment)}
                        />
                    ))}
                </div>
            )}
            <EnvironmentForm projectId={getProjectId()} ref={formDialogRef} callbackSubmit={loadEnvironments} />
        </PainelContainer>
    );
};

export default EnvironmentList;