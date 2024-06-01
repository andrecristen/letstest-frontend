import React from "react";
import { FiEdit, FiEye, FiPackage, FiFileText, FiPlayCircle, FiMove } from "react-icons/fi";
import { TestCaseData } from "../../models/TestCaseData";
import { useNavigate } from "react-router-dom";

interface TestCaseItemProps {
    testCase: TestCaseData
    onEdit?: () => void;
    onView?: () => void;
    onTestExecutions?: () => void;
    onExecuteTest?: () => void;
}

const TestCaseItem: React.FC<TestCaseItemProps> = ({ testCase, onEdit, onView, onTestExecutions, onExecuteTest }) => {

    const navigate = useNavigate();

    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {testCase.id}</p>
                    <p className="font-bold text-lg text-purple-700">{testCase.name}</p>
                    <p className="font-bold text-lg text-purple-700">{testCase.testScenario?.name}</p>
                    <p className="my-2 text-sm text-gray-500">Ambiente de Teste</p>
                    <p className="ml-2 text-sm text-gray-500">Nome: {testCase.environment?.name}</p>
                    <p className="ml-2 text-sm text-gray-500">Descrição: {testCase.environment?.description}</p>
                </div>
            </div>

            <div className="card-flex-actions-container">

                {testCase.testScenario?.id ? (
                    <button
                        onClick={() => navigate("/test-scenario/" + testCase.testScenario?.id + "/view")}
                        className="action-button-red"
                    >
                        <FiMove className="w-5 h-5 mr-2" /> Cenário
                    </button>
                ) : null}

                {onEdit ? (
                    <button
                        onClick={onEdit}
                        className="action-button-blue"
                    >
                        <FiEdit className="w-5 h-5 mr-2" /> Editar
                    </button>
                ) : null}

                {onView ? (
                    <button
                        onClick={onView}
                        className="action-button-green"
                    >
                        <FiEye className="w-5 h-5 mr-2" /> Visualizar
                    </button>
                ) : null}

                {onTestExecutions ? (
                    <button
                        onClick={onTestExecutions}
                        className="action-button-teal"
                    >
                        <FiPackage className="w-5 h-5 mr-2" /> Execuções
                    </button>
                ) : null}

                {onExecuteTest ? (
                    <button
                        onClick={onExecuteTest}
                        className="action-button-purple"
                    >
                        <FiPlayCircle className="w-5 h-5 mr-2" /> Testar
                    </button>
                ) : null}

            </div>
        </div>
    );
};

export default TestCaseItem;