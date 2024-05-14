import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestCaseItem from "./Item";
import PainelContainer from "../base/PainelContainer";
import TitleContainer from "../base/TitleContainer";
import { TestCaseData } from "../../types/TestCaseData";
import { getMyByProjects } from "../../services/testCaseService";

const TestCaseProjectTestList: React.FC = () => {
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
            const response = await getMyByProjects(parseInt(projectId || "0", 10));
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
                    className="form-input mr-2 py-2 px-8 text-lg h-16"
                />
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
                            onView={() => navigate(`/test-case/${testCase.id}/view`)}
                            onExecuteTest={() => navigate(`/test-executions/test/${projectId}/${testCase.id}`)}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TestCaseProjectTestList;