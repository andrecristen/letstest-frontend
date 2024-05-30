import React from "react";
import { FiEdit, FiEye, FiPackage, FiFileText, FiPlayCircle } from "react-icons/fi";

interface TestCaseItemProps {
    id?: number;
    name: string;
    onEdit?: () => void;
    onView?: () => void;
    onTestExecutions?: () => void;
    onExecuteTest?: () => void;
}

const TestCaseItem: React.FC<TestCaseItemProps> = ({ id, name, onEdit, onView, onTestExecutions, onExecuteTest }) => {
    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {id}</p>
                    <p className="font-bold text-lg text-purple-700">{name}</p>
                </div>
            </div>

            <div className="card-flex-actions-container">
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