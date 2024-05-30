import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestCaseItem from "./TestCaseItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { TestCaseData } from "../../models/TestCaseData";
import { getAllByProjects } from "../../services/testCaseService";

const TestCaseProjectOwnerList: React.FC = () => {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const [testCases, setTestCases] = useState<TestCaseData[]>([]);
    const [loadingTestCases, setLoadingTestCases] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadTestCases();
    }, []);

    const loadTestCases = async () => {
        setLoadingTestCases(true);
        try {
            const response = await getAllByProjects(parseInt(projectId || "0", 10));
            setTestCases(response?.data || []);
        } catch (error) {
            console.error("Erro ao carregar casos de teste:", error);
        } finally {
            setLoadingTestCases(false);
        }
    };

    const filteredTestCases = testCases.filter((testCase) =>
        testCase.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PainelContainer>
            <TitleContainer title="Casos de Teste" />

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
                    onClick={() => navigate(`/test-case/${projectId}/add`)}
                >
                    Criar Novo
                </button>
            </div>

            {loadingTestCases ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando casos de teste do projeto...</div>
            ) : filteredTestCases.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhum caso de teste encontrado</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredTestCases.map((testCase) => (
                        <TestCaseItem
                            key={testCase.id}
                            id={testCase.id}
                            name={testCase.name}
                            onEdit={() => navigate(`/test-case/${testCase.id}/edit`)}
                            onView={() => navigate(`/test-case/${testCase.id}/view`)}
                            onTestExecutions={() => navigate(`/test-executions/${testCase.id}`)}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TestCaseProjectOwnerList;