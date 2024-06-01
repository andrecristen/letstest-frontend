import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestScenarioItem from "./TestScenarioItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { getAllTestScenariosByProjects } from "../../services/testScenario";
import { TestScenarioData } from "../../models/TestScenarioData";

const TestScenarioList: React.FC = () => {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const [testScenarios, setTestScenarios] = useState<TestScenarioData[]>([]);
    const [loadingTestScenarios, setLoadingTestScenarios] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadTestScenarios();
    }, []);

    const loadTestScenarios = async () => {
        setLoadingTestScenarios(true);
        try {
            const response = await getAllTestScenariosByProjects(parseInt(projectId || "0", 10));
            setTestScenarios(response?.data || []);
        } catch (error) {
            console.error("Erro ao carregar cenários de teste:", error);
        } finally {
            setLoadingTestScenarios(false);
        }
    };

    const filteredTestScenarios = testScenarios.filter((testScenario) =>
        testScenario.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PainelContainer>
            <TitleContainer title="Cenários de Teste" />

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
                    onClick={() => navigate(`/test-scenario/${projectId}/add`)}
                >
                    Criar Novo
                </button>
            </div>

            {loadingTestScenarios ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando cenários de teste do projeto...</div>
            ) : filteredTestScenarios.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhum cenário de teste encontrado</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredTestScenarios.map((testScenario) => (
                        <TestScenarioItem
                            key={testScenario.id}
                            testScenario={testScenario}
                            onEdit={() => navigate(`/test-scenario/${testScenario.id}/edit`)}
                            onView={() => navigate(`/test-scenario/${testScenario.id}/view`)}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TestScenarioList;