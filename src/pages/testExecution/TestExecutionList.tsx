import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TestExecutionItem from "./TestExecutionItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { TestExecutionData } from "../../models/TestExecutionData";
import { getByTestCase, getMyByTestCase } from "../../services/testExecutionService";
import notifyProvider from "../../infra/notifyProvider";

const TestExecutionList: React.FC = () => {

    const { testCaseId } = useParams();
    const [testExecutions, setTestExecutions] = useState<TestExecutionData[]>([]);
    const [loadingTestExecutions, setLoadingTestExecutions] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const location = useLocation();
    const isUserView = location.pathname.includes("my");

    useEffect(() => {
        loadTestExecutions();
    }, []);

    const loadTestExecutions = async () => {
        setLoadingTestExecutions(true);
        try {
            let response;
            if (isUserView) {
                response = await getMyByTestCase(parseInt(testCaseId || "0", 10));
            } else {
                response = await getByTestCase(parseInt(testCaseId || "0", 10));
            }
            setTestExecutions(response?.data || []);
        } catch (error: any) {
            notifyProvider.error("Erro ao carregar execuções do caso de teste:" + error.toString());
        } finally {
            setLoadingTestExecutions(false);
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

            {loadingTestExecutions ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando execuções do caso de testes...</div>
            ) : filteredTestExecutions.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhuma execução para o caso de teste encontrada</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredTestExecutions.map((testExecutions) => (
                        <TestExecutionItem
                            testExecution={testExecutions}
                            isUserView={isUserView}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default TestExecutionList;