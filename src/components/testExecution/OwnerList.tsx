import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestExecutionItem from "./Item";
import PainelContainer from "../base/PainelContainer";
import TitleContainer from "../base/TitleContainer";
import { TestExecutionData } from "../../types/TestExecutionData";
import { getByTestCase } from "../../services/testExecutionService";
import notifyService from "../../services/notifyService";

const TestExecutionTestCaseOwnerList: React.FC = () => {
    const navigate = useNavigate();
    const { testCaseId } = useParams();
    const [testExecutions, setTestExecutions] = useState<TestExecutionData[]>([]);
    const [loadingTestCases, setLoadingTestCases] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadTestCases();
    }, []);

    const loadTestCases = async () => {
        setLoadingTestCases(true);
        try {
            const response = await getByTestCase(parseInt(testCaseId || "0", 10));
            setTestExecutions(response?.data || []);
        } catch (error: any) {
            notifyService.error("Erro ao carregar execuções do caso de teste:" + error.toString());
        } finally {
            setLoadingTestCases(false);
        }
    };

    const filteredTestExecutions = testExecutions.filter((testExecutions) =>
        testExecutions.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PainelContainer>
            <TitleContainer title={"Execuções do Caso de Teste #" + testCaseId} />

            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Buscar por #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input mr-2"
                />
            </div>

            {loadingTestCases ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando execuções do caso de testes...</div>
            ) : filteredTestExecutions.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhuma execução para o caso de teste encontrada</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredTestExecutions.map((testExecutions) => (
                        <TestExecutionItem
                            testExecution={testExecutions}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TestExecutionTestCaseOwnerList;