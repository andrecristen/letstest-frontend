import React from "react";
import { FiEdit, FiEye, FiPackage, FiFileText } from "react-icons/fi";

interface TestCaseItemProps {
    id?: number;
    name: string;
    onEdit: () => void;
    onView: () => void;
    onTestExecutions: () => void;
}

const TestCaseItem: React.FC<TestCaseItemProps> = ({ id, name, onEdit, onView, onTestExecutions }) => {
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
                <button
                    onClick={onEdit}
                    className="action-button-blue"
                >
                    <FiEdit className="w-5 h-5 mr-2" /> Editar
                </button>
                <button
                    onClick={onView}
                    className="action-button-green"
                >
                    <FiEye className="w-5 h-5 mr-2" /> Visualizar
                </button>
                <button
                    onClick={onTestExecutions}
                    className="action-button-teal"
                >
                    <FiPackage className="w-5 h-5 mr-2" /> Execuções
                </button>
            </div>
        </div>
    );
};

export default TestCaseItem;